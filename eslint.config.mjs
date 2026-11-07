import js from "@eslint/js";
import { defineConfig } from "eslint/config";

// GJS (GNOME JavaScript) globals available in GNOME Shell extension context
const gjsGlobals = {
  console: "readonly",
  TextDecoder: "readonly",
  TextEncoder: "readonly",
  log: "readonly",
  logError: "readonly",
  print: "readonly",
  printerr: "readonly",
};

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: gjsGlobals,
    },
  },
]);
