import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { flowApiPlugin } from './server/viteFlowPlugin.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.FLOW_API_KEY = env.FLOW_API_KEY || process.env.FLOW_API_KEY || '28F1BB16-B8A8-4A36-95D9-92643BE31L7E';
  process.env.FLOW_SECRET_KEY = env.FLOW_SECRET_KEY || process.env.FLOW_SECRET_KEY || 'f5aca74d33356b5c158c0a893ecd0b2c9f877838';
  process.env.FLOW_API_URL = env.FLOW_API_URL || process.env.FLOW_API_URL || 'https://www.flow.cl/api';

  return {
    plugins: [react(), flowApiPlugin()],
    server: {
      port: 3000,
      open: false,
      host: true
    }
  };
});

