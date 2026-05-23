import { defineConfig } from "nitro";

export default defineConfig({
  preset: "vercel",
  publicAssets: [{ dir: "dist" }],
  routeRules: {
    "/**": { redirect: { to: "/index.html", statusCode: 200 } },
    "/api/**": {},
  },
});