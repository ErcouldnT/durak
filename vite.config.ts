import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  // server: {
  //   host: true,
  //   strictPort: true,
  //   port: 5173,
  //   hmr: {
  //     protocol: "wss",
  //     host: "instruments-pty-inns-valuable.trycloudflare.com",
  //   },
  // },
});
