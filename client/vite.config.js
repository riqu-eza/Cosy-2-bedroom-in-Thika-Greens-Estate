import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://cosytwobedroominthika.online/',
        secure: false,
      },
    },
  },
  plugins: [react()],
})
