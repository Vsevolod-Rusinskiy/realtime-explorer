module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "boundaries"],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    "boundaries/include": ["src/**/*"],
    "boundaries/elements": [
      { type: "app", pattern: "app" },
      { type: "pages", pattern: "src/pages/*", capture: ["page"] },
      { type: "widgets", pattern: "widgets/*", capture: ["widget"] },
      { type: "features", pattern: "features/*", capture: ["feature"] },
      { type: "entities", pattern: "entities/*", capture: ["entity"] },
      { type: "shared", pattern: "shared/*", capture: ["segment"] },
    ],
  },
  rules: {
    "react-refresh/only-export-components": 0,
    "boundaries/entry-point": [
      1,
      {
        default: "disallow",
        rules: [
          { target: [["shared"]], allow: "**/index.ts" },
          { target: [["shared", { segment: "lib" }]], allow: "*.ts|tsx" },
          { target: [["shared", { segment: "constants" }]], allow: "index.ts" },
          { target: [["shared", { segment: "ui" }]], allow: "**" },
          { target: ["app", "pages", "widgets", "features", "entities"], allow: "index.(ts|tsx)" },
        ],
      },
    ],
    "boundaries/element-types": [
      1,
      {
        default: "allow",
        message: "${file.type} не может импортировать (${dependency.type})",
        rules: [
          { from: ["shared"], disallow: ["app", "pages", "widgets", "features", "entities"], message: "Модуль shared не должен импортировать верхние слои (${dependency.type})" },
          { from: ["entities"], message: "Сущность не должна импортировать верхние слои (${dependency.type})", disallow: ["app", "pages", "widgets", "features"] },
          { from: ["entities"], message: "Сущность не должна импортировать другие сущности", disallow: [["entities", { entity: "!${entity}" }]] },
          { from: ["features"], message: "Фича не должна импортировать верхние слои (${dependency.type})", disallow: ["app", "pages", "widgets"] },
          { from: ["features"], message: "Фича не должна импортировать другие фичи", disallow: [["features", { feature: "!${feature}" }]] },
          { from: ["widgets"], message: "Виджет не должен импортировать верхние слои (${dependency.type})", disallow: ["app", "pages"] },
          { from: ["widgets"], message: "Виджет не должен импортировать другие виджеты", disallow: [["widgets", { widget: "!${widget}" }]] },
          { from: ["pages"], message: "Страница не должна импортировать верхние слои (${dependency.type})", disallow: ["app"] },
          { from: ["pages"], message: "Страница не должна импортировать другие страницы", disallow: [["pages", { page: "!${page}" }]] },
        ],
      },
    ],
    "@typescript-eslint/no-empty-function": 1,
    "@typescript-eslint/ban-ts-comment": 1,
    "@typescript-eslint/ban-types": 1,
    "@typescript-eslint/no-inferrable-types": 1,
  },
}
