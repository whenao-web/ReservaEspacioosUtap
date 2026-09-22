# CONTRATO DEL API — VERSION SUPABASE

> Proyecto base: Sistema de Reservas de Espacios.
> Con Supabase no se escriben rutas HTTP: PostgREST las genera desde las tablas,
> las vistas y las funciones. Este contrato dice **que llamada hace el frontend
> para cada operacion**, quien puede hacerla y que errores puede recibir.
>
> Todas las llamadas estan en `frontend/src/services/`. Ningun componente
> habla con Supabase directamente.

## 1. Los 14 puntos de la API

| # | Operacion | Llamada con supabase-js | Quien | Errores de negocio |
|:--:|---|---|---|---|
| 1 | Registrarse | `auth.signUp({ email, password, options: { data: { nombre } } })` | publico | `user_already_exists`, `weak_password` |
| 2 | Iniciar sesion | `auth.signInWithPassword({ email, password })` | publico | `invalid_credentials` |
| 3 | Listar espacios | `from('espacios').select(...)` | publico | — (RLS: solo activos) |
| 4 | Detalle de un espacio | `from('espacios').select(...).eq('id', id).single()` | publico | `PGRST116` si no existe |
| 5 | Crear espacio | `from('espacios').insert(...)` | admin | `23505` nombre repetido · `42501` no admin |
| 6 | Editar espacio | `from('espacios').update(...).eq('id', id)` | admin | 0 filas si no es admin |
| 7 | Activar o desactivar | `from('espacios').update({ activo }).eq('id', id)` | admin | 0 filas si no es admin |
| 8 | Eliminar espacio | `from('espacios').delete().eq('id', id)` | admin | `23503` tiene reservas |
| 9 | Disponibilidad | `rpc('disponibilidad', { p_espacio_id, p_fecha })` | publico | — |
| 10 | **Crear reserva** | `from('reservas').insert({ espacio_id, fecha, hora_inicio, hora_fin, motivo })` | usuario | `23P01` `LIMITE_RESERVAS` `ESPACIO_INACTIVO` `FECHA_PASADA` `23514` |
| 11 | Mis reservas | `from('mis_reservas').select('*')` | usuario | — |
| 12 | Todas las reservas | `from('reservas').select(...)` | admin | — (RLS: el usuario solo ve las suyas) |
| 13 | **Cancelar reserva** | `rpc('cancelar_reserva', { p_reserva_id })` | usuario / admin | `FUERA_DE_PLAZO` `NO_AUTORIZADO` `YA_CANCELADA` `NO_ENCONTRADA` |
| 14 | Reporte de ocupacion | `rpc('reporte_ocupacion', { p_desde, p_hasta })` | admin | `NO_AUTORIZADO` `RANGO_INVALIDO` |

## 2. Forma de los errores

Supabase devuelve `{ code, message, details, hint }`.

| Origen | `code` | `message` |
|---|---|---|
| Disparador o funcion propia | `P0001` | El codigo de negocio: `LIMITE_RESERVAS`, `FUERA_DE_PLAZO`... |
| Restriccion `sin_solapamiento` | `23P01` | `conflicting key value violates exclusion constraint...` |
| Clave foranea | `23503` | — |
| Valor unico repetido | `23505` | — |
| `CHECK` | `23514` | — |
| RLS o privilegios | `42501` | — |

La traduccion a mensajes para el usuario esta en un solo lugar:
`frontend/src/lib/errores.js`.

## 3. Lo que el frontend NUNCA envia

| Campo | Por que |
|---|---|
| `usuario_id` al reservar | Lo pone la base de datos (`default auth.uid()`). RLS rechaza cualquier otro |
| `estado` al reservar | El disparador lo fuerza a `confirmada` |
| `rol` al registrarse | El rol lo decide la base de datos. Si viajara, cualquiera seria administrador |
| `cancelable` | Lo calcula la vista `mis_reservas` con la regla de las 2 horas |

## 4. Registro de cambios

| Fecha | Que cambio | Por que |
|---|---|---|
| | | |
