import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4178",
    viewport: { width: 1075, height: 908 }
  },
  webServer: {
    command: "python3 -m http.server 4178",
    url: "http://127.0.0.1:4178",
    reuseExistingServer: true
  }
});
