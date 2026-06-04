import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  server: {
    host: '0.0.0.0',     // Ermöglicht Netzwerkzugriff
    https: true,          // Aktiviert HTTPS
    port: 5173            // Port (kannst du ändern)
  },
  plugins: [
    basicSsl()           // Erstellt selbst-signiertes SSL-Zertifikat
  ]
})