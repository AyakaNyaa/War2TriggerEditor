import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:47862', channel: 'msedge', headless: true, viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: 'node ../../tools/test_server.mjs',
    url: 'http://127.0.0.1:47862',
    reuseExistingServer: false,
    timeout: 30000,
  },
  reporter: 'list',
});
