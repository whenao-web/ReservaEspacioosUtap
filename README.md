# Sistema de Reservas de Espacios

**Proyecto base del curso de opción de grado — Desarrollo Web Full Stack con IA**
Fundación Tecnológica Autónoma del Pacífico

## El problema

Los espacios compartidos de la institución —salas de reunión, laboratorios, auditorio— se solicitan por WhatsApp o en persona, y se anotan en un Excel que administra una sola persona. Las reservas se cruzan, nadie puede consultar disponibilidad sin preguntar y la institución no tiene datos de uso.

## Las seis reglas de negocio

| # | Regla | Dónde vive |
|:--:|---|---|
| 1 | No se reserva un espacio con una reserva confirmada que se solape | `supabase/migrations/..._reglas_de_negocio.sql` · restricción `sin_solapamiento` |
| 2 | Las reservas adyacentes son válidas (10–12 y 12–14) | La misma restricción: rango `'[)'` |
| 3 | Una reserva cancelada libera la franja | La misma restricción: `where (estado = 'confirmada')` |
| 4 | No se cancela con menos de 2 horas | Disparador `validar_cambio_reserva` |
| 5 | Máximo 3 reservas activas por usuario | Disparador `validar_nueva_reserva`, con candado |
| 6 | Un espacio desactivado no acepta reservas | Disparador `validar_nueva_reserva` + RLS de lectura |

## Arquitectura

**Supabase** (PostgreSQL, Auth, PostgREST) + **React con Vite**, publicado en **GitHub Pages**.

## Estructura

```
frontend/             React + Vite. Lo UNICO que se publica es frontend/dist/
  src/services/       el unico lugar que habla con Supabase
  src/lib/errores.js  traduce los codigos de error a mensajes
supabase/
  migrations/         el esquema, las reglas, la seguridad y las funciones, en orden
  seed.sql            datos base (inventados)
  pruebas/            pruebas automaticas de las reglas y de RLS
api/contrato.md       que llamada hace el frontend para cada operacion
ia/registro-ia.md     el registro de uso de IA
informe/              las evidencias del documento de grado. NO se publica
.github/workflows/    despliegue del frontend y pruebas de la base de datos
```

## Cómo se ejecuta en desarrollo

```bash
cd frontend
cp .env.example .env.local      # y completar con los datos del proyecto
npm install
npm run dev
```

## Pruebas de la base de datos

```bash
cd supabase/pruebas
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres bash aplicar.sh
npm install
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pruebas npm test
```

35 pruebas: las seis reglas, las políticas de seguridad, las funciones y una prueba de concurrencia.

## Uso de IA

Todo uso queda registrado en [`ia/registro-ia.md`](ia/registro-ia.md). **La IA ayuda. El estudiante decide y verifica.**
