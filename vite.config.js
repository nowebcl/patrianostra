import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { flowApiPlugin } from './server/viteFlowPlugin.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.FLOW_API_KEY = env.FLOW_API_KEY || process.env.FLOW_API_KEY || '';
  process.env.FLOW_SECRET_KEY = env.FLOW_SECRET_KEY || process.env.FLOW_SECRET_KEY || '';
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
