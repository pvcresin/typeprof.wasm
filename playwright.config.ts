import { defineConfig } from "@playwright/test";

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

// vite.config.prod hardcodes `base` to the GitHub Pages URL; override it to `/` for local serving.
const command = `npm run build -- --base=/ && npx vite preview --config vite.config.prod --base / --host 127.0.0.1 --port ${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: {
    timeout: 60_000,
  },
  workers: 1,
  use: {
    baseURL,
  },
  webServer: {
    command,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
