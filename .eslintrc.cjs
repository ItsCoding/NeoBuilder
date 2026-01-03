module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  settings: {
    next: {
      rootDir: ["packages/admin", "packages/web"],
    },
  },
  extends: ["next/core-web-vitals", "prettier"],
  ignorePatterns: ["*.config.js", "*.config.cjs", "dist", "build", "node_modules"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      },
    },
  ],
};
