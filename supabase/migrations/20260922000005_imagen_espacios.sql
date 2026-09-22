-- ===========================================================================
--  MIGRACION 5 — IMAGEN DE CADA ESPACIO
--  Primer cambio de esquema despues de subir las cuatro primeras: por eso es
--  una migracion NUEVA y no una edicion de la 1.
--
--  imagen guarda una ruta relativa al sitio (img/espacios/sala-a.jpg) o una
--  URL completa https://... Si es null, el frontend muestra una ilustracion
--  segun el tipo de espacio.
-- ===========================================================================

alter table public.espacios
  add column imagen text
  check (
    imagen is null
    or (char_length(imagen) <= 300
        and (imagen like 'https://%' or imagen ~ '^img/[a-z0-9/_.-]+$'))
  );

comment on column public.espacios.imagen is
  'Ruta relativa (img/espacios/archivo.jpg) o URL https. Null: ilustracion por tipo.';
