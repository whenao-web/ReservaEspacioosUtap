import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";

// Pruebas de las reglas de negocio, las politicas RLS y las funciones.
// Se ejecutan contra un PostgreSQL de prueba preparado con aplicar.sh,
// que simula lo que Supabase trae (auth.uid(), roles anon y authenticated).
//   DATABASE_URL=postgres://postgres:postgres@localhost:5432/pruebas node --test
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const U = {};

// Ejecuta SQL como lo haria Supabase para una peticion de ese usuario
async function como(uid, sql, params = []) {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await c.query(`set local role ${uid ? "authenticated" : "anon"}`);
    await c.query("select set_config('request.jwt.claims', $1, true)",
      [JSON.stringify(uid ? { sub: uid, role: "authenticated" } : { role: "anon" })]);
    const r = await c.query(sql, params);
    await c.query("commit");
    return r;
  } catch (e) { await c.query("rollback"); throw e; }
  finally { c.release(); }
}
const admin = sql => pool.query(sql);
const falla = async (p, patron) => {
  await assert.rejects(p, e => { assert.match(`${e.code} ${e.message}`, patron); return true; });
};

// fecha local de Colombia a N dias
const dia = n => new Date(Date.now() - 5 * 3600e3 + n * 86400e3).toISOString().slice(0, 10);
const M = dia(1), P = dia(2);
const reservar = (uid, esp, f, i, fin) =>
  como(uid, "insert into reservas (espacio_id, fecha, hora_inicio, hora_fin) values ($1,$2,$3,$4) returning *", [esp, f, i, fin]);

before(async () => {
  for (const [k, email, meta] of [
    ["ana", "ana@ejemplo.test", { nombre: "Ana Prueba" }],
    ["beto", "beto@ejemplo.test", { nombre: "Beto Prueba", rol: "admin" }],   // intento de escalada
    ["caro", "caro@ejemplo.test", {}],
    ["dora", "dora@ejemplo.test", { nombre: "Dora Admin" }]
  ]) {
    const r = await admin(`insert into auth.users (email, raw_user_meta_data) values ('${email}', '${JSON.stringify(meta)}') returning id`);
    U[k] = r.rows[0].id;
  }
  await admin(`update perfiles set rol = 'admin' where id = '${U.dora}'`);  // paso 9 de la guia
});
after(() => pool.end());

test("registro: crea el perfil con el nombre de los metadatos", async () => {
  const r = await admin(`select nombre, rol from perfiles where id = '${U.ana}'`);
  assert.deepEqual(r.rows[0], { nombre: "Ana Prueba", rol: "usuario" });
});
test("registro: sin nombre, usa la parte local del correo", async () => {
  const r = await admin(`select nombre from perfiles where id = '${U.caro}'`);
  assert.equal(r.rows[0].nombre, "caro");
});
test("SEGURIDAD: registrarse con rol admin en los metadatos NO da rol admin", async () => {
  const r = await admin(`select rol from perfiles where id = '${U.beto}'`);
  assert.equal(r.rows[0].rol, "usuario");
});
test("SEGURIDAD: un usuario no puede cambiarse el rol", async () => {
  await falla(como(U.ana, `update perfiles set rol = 'admin' where id = '${U.ana}'`), /42501|permission denied/);
});
test("un usuario si puede cambiar su nombre", async () => {
  const r = await como(U.ana, `update perfiles set nombre = 'Ana P.' where id = auth.uid() returning nombre`);
  assert.equal(r.rows[0].nombre, "Ana P.");
});
test("anonimo ve los 7 espacios activos", async () => {
  const r = await como(null, "select count(*)::int n from espacios");
  assert.equal(r.rows[0].n, 7);
});
test("SEGURIDAD: anonimo no puede leer reservas", async () => {
  await falla(como(null, "select * from reservas"), /42501|permission denied/);
});

test("REGLA 1 y 2: base 10-12 y adyacente 12-14 se aceptan", async () => {
  await reservar(U.ana, 1, M, "10:00", "12:00");
  await reservar(U.caro, 1, M, "12:00", "14:00");
});
test("REGLA 1: parcial 11-13 se rechaza", async () => {
  await falla(reservar(U.caro, 1, M, "11:00", "13:00"), /23P01/);
});
test("REGLA 1: envolvente 09:30-12:30 se rechaza", async () => {
  await falla(reservar(U.caro, 1, M, "09:30", "12:30"), /23P01/);
});
test("REGLA 1: identica 10-12 se rechaza", async () => {
  await falla(reservar(U.caro, 1, M, "10:00", "12:00"), /23P01/);
});
test("REGLA 1: la misma franja en OTRO espacio si se acepta", async () => {
  await reservar(U.caro, 2, M, "10:00", "12:00");
});
test("SEGURIDAD: no se puede reservar a nombre de otro", async () => {
  await falla(como(U.caro, "insert into reservas (usuario_id, espacio_id, fecha, hora_inicio, hora_fin) values ($1, 3, $2, '08:00', '09:00')", [U.ana, M]),
    /42501|row-level security/);
});
test("fecha pasada se rechaza", async () => {
  await falla(reservar(U.ana, 3, dia(-1), "10:00", "11:00"), /FECHA_PASADA/);
});
test("duracion menor a 30 minutos se rechaza", async () => {
  await falla(reservar(U.ana, 3, M, "10:00", "10:15"), /23514|chk_duracion/);
});
test("cada usuario ve solo sus reservas", async () => {
  const r = await como(U.caro, "select distinct usuario_id from reservas");
  assert.deepEqual(r.rows.map(x => x.usuario_id), [U.caro]);
});
test("el administrador ve todas las reservas", async () => {
  const r = await como(U.dora, "select count(*)::int n from reservas");
  assert.equal(r.rows[0].n, 3);
});
test("disponibilidad: el anonimo ve las franjas ocupadas, sin datos de quien", async () => {
  const r = await como(null, "select * from disponibilidad(1, $1)", [M]);
  assert.deepEqual(r.rows, [{ hora_inicio: "10:00:00", hora_fin: "12:00:00" }, { hora_inicio: "12:00:00", hora_fin: "14:00:00" }]);
  assert.deepEqual(Object.keys(r.rows[0]), ["hora_inicio", "hora_fin"]);
});

test("REGLA 5: la cuarta reserva activa se rechaza", async () => {
  await reservar(U.beto, 3, P, "08:00", "09:00");
  await reservar(U.beto, 3, P, "09:00", "10:00");
  await reservar(U.beto, 3, P, "10:00", "11:00");
  await falla(reservar(U.beto, 3, P, "11:00", "12:00"), /LIMITE_RESERVAS/);
});

test("SEGURIDAD: un usuario no puede modificar una reserva directamente", async () => {
  await falla(como(U.ana, "update reservas set hora_fin = '13:00' where usuario_id = auth.uid()"), /42501|permission denied/);
});
test("cancelar: otro usuario no puede cancelar mi reserva", async () => {
  const id = (await admin(`select id from reservas where usuario_id = '${U.ana}'`)).rows[0].id;
  await falla(como(U.caro, "select cancelar_reserva($1)", [id]), /NO_AUTORIZADO/);
});
test("REGLA 3: cancelar deja la fecha de cancelacion y libera la franja", async () => {
  const id = (await admin(`select id from reservas where usuario_id = '${U.ana}'`)).rows[0].id;
  const r = await como(U.ana, "select * from cancelar_reserva($1)", [id]);
  assert.equal(r.rows[0].estado, "cancelada");
  assert.ok(r.rows[0].cancelada_en);
  await reservar(U.caro, 1, M, "10:00", "12:00");   // la misma franja, ahora libre
});
test("cancelar dos veces se rechaza", async () => {
  const id = (await admin(`select id from reservas where usuario_id = '${U.ana}'`)).rows[0].id;
  await falla(como(U.ana, "select cancelar_reserva($1)", [id]), /YA_CANCELADA/);
});
test("una reserva cancelada no se reactiva ni siquiera por el administrador de la BD", async () => {
  await falla(admin(`update reservas set estado = 'confirmada' where usuario_id = '${U.ana}'`), /NO_REACTIVABLE/);
});
test("una reserva no se edita, ni siquiera por el administrador de la BD", async () => {
  await falla(admin(`update reservas set hora_fin = '13:30' where usuario_id = '${U.caro}' and espacio_id = 2`), /RESERVA_INMUTABLE/);
});

test("REGLA 4: no se cancela con menos de 2 horas (reserva que ya empezo)", async () => {
  // se inserta como superusuario sin disparadores para simular una reserva de hace un rato
  await admin("alter table reservas disable trigger trg_validar_nueva_reserva");
  const hoy = dia(0);
  const r = await admin(`insert into reservas (usuario_id, espacio_id, fecha, hora_inicio, hora_fin)
                         values ('${U.ana}', 4, '${hoy}', '00:00', '00:30') returning id`);
  await admin("alter table reservas enable trigger trg_validar_nueva_reserva");
  await falla(como(U.ana, "select cancelar_reserva($1)", [r.rows[0].id]), /FUERA_DE_PLAZO/);
});
test("mis_reservas calcula cancelable en el servidor", async () => {
  const r = await como(U.ana, "select fecha::text, hora_inicio, estado, cancelable from mis_reservas order by fecha, hora_inicio");
  const porEstado = Object.fromEntries(r.rows.map(x => [`${x.estado}-${x.hora_inicio}`, x.cancelable]));
  assert.equal(porEstado["cancelada-10:00:00"], false);
  assert.equal(porEstado["confirmada-00:00:00"], false);
});

test("REGLA 6: el administrador desactiva un espacio; ya no se puede reservar", async () => {
  const r = await como(U.dora, "update espacios set activo = false where nombre = 'Cancha Multiple' returning id");
  assert.equal(r.rowCount, 1);
  await falla(reservar(U.caro, r.rows[0].id, P, "15:00", "16:00"), /ESPACIO_INACTIVO/);
});
test("REGLA 6: el inactivo desaparece para el publico, no para el administrador", async () => {
  assert.equal((await como(null, "select count(*)::int n from espacios")).rows[0].n, 6);
  assert.equal((await como(U.dora, "select count(*)::int n from espacios")).rows[0].n, 7);
});
test("SEGURIDAD: un usuario comun no puede editar espacios (0 filas)", async () => {
  const r = await como(U.ana, "update espacios set capacidad = 1 where id = 1");
  assert.equal(r.rowCount, 0);
});
test("borrar un espacio con reservas se rechaza (historico)", async () => {
  await falla(como(U.dora, "delete from espacios where id = 1"), /23503/);
});

test("reporte: un usuario comun no puede verlo", async () => {
  await falla(como(U.ana, "select * from reporte_ocupacion($1, $2)", [M, P]), /NO_AUTORIZADO/);
});
test("reporte: rango invertido se rechaza", async () => {
  await falla(como(U.dora, "select * from reporte_ocupacion($1, $2)", [P, M]), /RANGO_INVALIDO/);
});
test("reporte: incluye espacios SIN reservas y respeta el rango", async () => {
  const r = await como(U.dora, "select * from reporte_ocupacion($1, $1)", [M]);
  assert.equal(r.rows.length, 7);                                    // LEFT JOIN: todos los espacios
  const salaA = r.rows.find(x => x.espacio === "Sala A");
  assert.equal(Number(salaA.horas_reservadas), 4);                   // 12-14 y 10-12 de caro
  assert.equal(Number(salaA.horas_canceladas), 2);                   // la de ana
  const directiva = r.rows.find(x => x.espacio === "Sala Directiva");
  assert.equal(Number(directiva.reservas), 0);                        // las de beto son del dia P
});

test("CONCURRENCIA: dos reservas simultaneas del mismo usuario no superan el limite", async () => {
  const [u] = (await admin(`insert into auth.users (email) values ('eva@ejemplo.test') returning id`)).rows;
  await reservar(u.id, 5, P, "08:00", "09:00");
  await reservar(u.id, 5, P, "09:00", "10:00");
  // dos conexiones a la vez: la primera se queda 1 s dentro de la transaccion
  const lenta = (async () => {
    const c = await pool.connect();
    try {
      await c.query("begin"); await c.query("set local role authenticated");
      await c.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: u.id })]);
      await c.query("insert into reservas (espacio_id, fecha, hora_inicio, hora_fin) values (5, $1, '10:00', '11:00')", [P]);
      await c.query("select pg_sleep(1)"); await c.query("commit"); return "ok";
    } catch (e) { await c.query("rollback"); return e.message; } finally { c.release(); }
  })();
  await new Promise(r => setTimeout(r, 200));
  const rapida = reservar(u.id, 5, P, "11:00", "12:00").then(() => "ok", e => e.message);
  const res = await Promise.all([lenta, rapida]);
  assert.deepEqual(res.sort(), ["LIMITE_RESERVAS", "ok"]);
  const n = (await admin(`select count(*)::int n from reservas where usuario_id = '${u.id}'`)).rows[0].n;
  assert.equal(n, 3);
});
