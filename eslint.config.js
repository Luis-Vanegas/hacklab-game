import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Regla del proyecto: cero `any`
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      // Permite `const { run, ...resto } = x` para descartar un campo sin usarlo
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  {
    // El engine es lógica pura: no puede depender de la UI ni de React
    files: ["src/engine/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "@react-three/*", "three"],
              message: "engine/ es lógica pura, sin UI.",
            },
            {
              group: ["**/ui/**", "**/scenes/**", "**/terminal/**"],
              message: "engine/ no depende de capas de presentación.",
            },
          ],
        },
      ],
    },
  },
  {
    // La UI lee y cambia el estado solo a través de los hooks de src/store
    files: ["src/ui/**/*.{ts,tsx}", "src/scenes/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/engine/**", "@/engine", "@/engine/*"],
              message: "La UI usa los hooks de @/store, no el engine directo.",
            },
          ],
        },
      ],
    },
  },
  {
    // Los comandos solo hablan con el engine a través de CommandContext
    files: ["src/terminal/commands/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/engine/**", "@/engine/*"],
              message: "Usa CommandContext, no importes engine/ directo.",
            },
          ],
        },
      ],
    },
  },
);
