import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En GitHub Pages el sitio vive en https://usuario.github.io/REPOSITORIO/
// El workflow de despliegue define BASE_PATH=/REPOSITORIO/
// En desarrollo no se define y queda '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/',
})
