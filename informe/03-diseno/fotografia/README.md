# Guía para tomar y subir las fotografías

## Dónde se guardan: en el repositorio, no en Supabase

| Qué | Carpeta | Nombre del archivo |
|---|---|---|
| Banner de la portada | `frontend/public/img/banner/` | `inicio.jpg` |
| Foto de cada espacio | `frontend/public/img/espacios/` | El nombre del espacio en minúsculas, sin tildes, con guiones: `sala-mac.jpg`, `sala-dibujo.jpg`, `laboratorio-redes.jpg` |
| Logo (solo con autorización de la institución) | `frontend/public/img/` | `logo.png` |
| Estas plantillas | `informe/03-diseno/fotografia/` | No se publican |

**Por qué en el repositorio:** son imágenes fijas que cambian muy pocas veces. En el repositorio quedan versionadas, GitHub Pages las publica sin costo y no hay que configurar permisos. Supabase Storage tendría sentido si el administrador subiera fotos desde la aplicación; hoy no es el caso.

**Cómo las encuentra la aplicación:** por el nombre. Si existe `img/espacios/sala-mac.jpg`, la tarjeta de "Sala Mac" la muestra sola. Si no existe, muestra la ilustración de su tipo. No hay que tocar la base de datos.

Si una foto necesita otro nombre, se asigna en **Administrar → Imagen**, con la ruta `img/espacios/archivo.jpg`.

## Cómo se convierte el nombre del espacio en nombre de archivo

| Nombre del espacio | Archivo |
|---|---|
| Sala Mac | `sala-mac.jpg` |
| Sala Dibujo | `sala-dibujo.jpg` |
| Auditorio Principal | `auditorio-principal.jpg` |
| Sala Múltiple 2 | `sala-multiple-2.jpg` |

Reglas: minúsculas, sin tildes ni ñ, espacios convertidos en guiones, extensión `.jpg`.

## Cómo tomar las fotos

### Banner — `plantilla-banner-1920x800.png`

- **Tamaño final:** 1920 × 800 px, JPG, menos de 500 KB.
- **Horizontal.**
- **El sujeto va en el tercio derecho.** La mitad izquierda queda tapada por el velo violeta donde va el título.
- **Nada importante arriba ni abajo de las líneas punteadas:** según el ancho de la pantalla, esa franja se recorta.
- **En celular** se ve solo el centro de la foto (rectángulo rojo de la plantilla).

### Espacios — `plantilla-espacio-1200x750.png`

- **Tamaño final:** 1200 × 750 px (proporción 16:10), JPG, menos de 300 KB.
- **Horizontal**, desde una esquina, para que se vea el espacio completo.
- **La franja inferior** queda bajo el degradado donde va el nombre: no deje ahí nada importante.
- **La esquina superior izquierda** la tapa la etiqueta del tipo.

### Para todas

```
[ ] Espacio vacío. Si aparecen personas, deben haber autorizado la foto
[ ] Sin pantallas con información, tableros con nombres ni documentos a la vista
[ ] Luz natural o luces encendidas; sin contraluz de ventanas
[ ] Cámara a la altura del pecho, recta (sin inclinar)
[ ] Recortar y reducir al tamaño final antes de subir
```

El repositorio es público: cualquier persona puede ver estas fotos.

## Cómo reducir el tamaño

Cualquier editor sirve. Una opción gratuita en el navegador es squoosh.app: se abre la foto, se ajusta el tamaño y la calidad (75 a 80) y se descarga en JPG.

## Cómo subirlas

```bash
git add frontend/public/img
git commit -m "Fotografías de los espacios"
git push
```

El flujo de GitHub Actions publica el sitio de nuevo en uno o dos minutos.
