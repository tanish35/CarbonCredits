import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import path from "path"; // Add path import

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
