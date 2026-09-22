// Traduce los errores de la base de datos a mensajes para el usuario.
// Los codigos en MAYUSCULAS son los que lanzan los disparadores y funciones
// de supabase/migrations/. Si aparece uno nuevo alla, se agrega aqui.

const NEGOCIO = {
  FRANJA_OCUPADA:    'La franja solicitada ya está ocupada.',
  LIMITE_RESERVAS:   'Ya tiene 3 reservas activas. Cancele una para crear otra.',
  ESPACIO_INACTIVO:  'Ese espacio no está recibiendo reservas.',
  FECHA_PASADA:      'No se puede reservar una franja que ya empezó.',
  FUERA_DE_PLAZO:    'No se puede cancelar con menos de 2 horas de anticipación.',
  YA_CANCELADA:      'La reserva ya estaba cancelada.',
  NO_REACTIVABLE:    'Una reserva cancelada no se puede reactivar.',
  RESERVA_INMUTABLE: 'Una reserva no se edita: se cancela y se crea otra.',
  NO_ENCONTRADA:     'La reserva no existe.',
  NO_AUTORIZADO:     'No tiene permiso para hacer esto.',
  RANGO_INVALIDO:    'La fecha inicial debe ser anterior a la final.',
  TIENE_RESERVAS:    'El espacio tiene reservas: desactívelo en lugar de borrarlo.',
  NOMBRE_REPETIDO:   'Ya existe un registro con ese nombre.',
}

// Codigos estandar de PostgreSQL que la aplicacion espera
const POSTGRES = {
  '23P01': 'FRANJA_OCUPADA',   // exclusion_violation: la restriccion sin_solapamiento
  '23503': 'TIENE_RESERVAS',   // foreign_key_violation al borrar
  '23505': 'NOMBRE_REPETIDO',  // unique_violation
  '42501': 'NO_AUTORIZADO',    // RLS o privilegios
}

const AUTH = {
  invalid_credentials:  'Correo o contraseña incorrectos.',
  user_already_exists:  'Ya existe una cuenta con ese correo.',
  email_not_confirmed:  'Confirme su correo antes de iniciar sesión.',
  weak_password:        'La contraseña es demasiado débil.',
}

export function traducirError(error) {
  if (!error) return ''
  if (NEGOCIO[error.message]) return NEGOCIO[error.message]
  if (POSTGRES[error.code]) return NEGOCIO[POSTGRES[error.code]]
  if (AUTH[error.code]) return AUTH[error.code]
  if (error.code === '23514') return 'Algún dato no cumple las reglas (por ejemplo, la duración de la reserva).'
  console.error(error)   // lo no previsto se registra para depurarlo
  return 'Ocurrió un error inesperado. Intente de nuevo.'
}
