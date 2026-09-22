# DECISIONES DE ARQUITECTURA — PROYECTO BASE

## Ruta elegida
[ ] Servidor propio   [x] Supabase, con frontend React + Vite

**Por que:** las seis reglas de negocio son reglas sobre datos (choques de horario,
conteos, estados). En Supabase se escriben donde se hacen cumplir siempre: en la
base de datos. Ademas, Supabase resuelve registro, inicio de sesion y despliegue
del backend, lo que libera tiempo para las reglas y las pruebas.

**Que se gano:** las reglas se cumplen aunque alguien llame a la API sin pasar
por la interfaz. Autenticacion lista. Un servicio menos que desplegar.

**Que se perdio:** no se escribe un servidor HTTP propio, y con el se pierde la
practica de disenar rutas, capas y middlewares. La logica queda en SQL y
PL/pgSQL, que es mas dificil de depurar que JavaScript. Dependencia de un
proveedor: el plan gratuito pausa el proyecto tras 7 dias sin actividad.

**React en lugar de HTML, CSS y JavaScript sin libreria:** decision del docente
para el proyecto base. Se gana composicion de componentes y un manejo ordenado
del estado de cada pantalla; se agrega una herramienta de construccion (Vite) y
un paso de compilacion antes de publicar.

## Donde vive cada regla de negocio

| # | Regla | Archivo | Objeto |
|:--:|---|---|---|
| 1 | No solapar | `supabase/migrations/20260922000002_reglas_de_negocio.sql` | restriccion `sin_solapamiento` |
| 2 | Adyacentes validas | el mismo | rango `'[)'` en `sin_solapamiento` |
| 3 | Cancelar libera | el mismo | `where (estado = 'confirmada')` en `sin_solapamiento` |
| 4 | 2 horas para cancelar | el mismo | funcion `validar_cambio_reserva()` |
| 5 | Maximo 3 activas | el mismo | funcion `validar_nueva_reserva()`, con `pg_advisory_xact_lock` |
| 6 | Espacio desactivado | el mismo, y `..._seguridad_rls.sql` | `validar_nueva_reserva()` y politica de lectura de `espacios` |

## Decisiones de modelado

**Estado como texto con CHECK, no como tabla.** La restriccion de solapamiento
se escribe `where (estado = 'confirmada')` en vez de depender de que el id 1
signifique "confirmada". El conjunto de estados es cerrado y pequeno.

**Cancelar es un cambio de estado, no un DELETE.** El reporte necesita las
horas canceladas, y la regla 4 necesita saber cuando se cancelo.

**Hora TIME separada de la fecha.** Consecuencia: una reserva no puede cruzar
la medianoche (`check (hora_fin > hora_inicio)`). Confirmado con el cliente:
[pendiente de confirmar en la entrevista].

**Las reservas no se editan.** Solo se cancelan (funcion `cancelar_reserva`).
Permitir editar abriria un camino para esquivar el limite de 3 y el plazo de
2 horas.

## La condicion de carrera

Dos usuarios que reservan la misma sala en el mismo instante: la restriccion
`sin_solapamiento` lo impide dentro de PostgreSQL, sin importar el orden.

Un mismo usuario que envia dos reservas a la vez teniendo 2 activas: sin el
candado `pg_advisory_xact_lock`, los dos conteos ven 2 y quedan 4 reservas.
Comprobado con la prueba "CONCURRENCIA" de `supabase/pruebas/`: sin el candado
la prueba falla; con el candado, pasa.
