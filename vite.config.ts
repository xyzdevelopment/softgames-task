import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true,  // Enables access from local network (WiFi IP)
        port: 5173,  // You can change this port if needed
        strictPort: true,  // Ensures the exact port is used (fails if unavailable)
    }
});