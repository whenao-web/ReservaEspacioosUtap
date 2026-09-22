-- Datos base. Los usuarios NO se siembran aqui: se crean registrandose en la
-- aplicacion. El primer administrador se promueve a mano (ver la guia, paso 9).

insert into public.tipos_espacio (nombre, descripcion) values
  ('Sala de reuniones', 'Espacios cerrados para reuniones de trabajo'),
  ('Laboratorio',       'Espacios con equipamiento especializado'),
  ('Auditorio',         'Espacios para eventos y presentaciones'),
  ('Cancha',            'Espacios deportivos');

insert into public.espacios (tipo_espacio_id, nombre, capacidad, ubicacion) values
  (1, 'Sala A',               8,   'Bloque 1 - Piso 2'),
  (1, 'Sala B',               12,  'Bloque 1 - Piso 2'),
  (1, 'Sala Directiva',       6,   'Bloque 1 - Piso 3'),
  (2, 'Laboratorio Redes',    25,  'Bloque 2 - Piso 1'),
  (2, 'Laboratorio Software', 30,  'Bloque 2 - Piso 1'),
  (3, 'Auditorio Principal',  180, 'Bloque 3'),
  (4, 'Cancha Multiple',      40,  'Zona deportiva');
