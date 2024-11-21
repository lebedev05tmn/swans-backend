import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import prettierConfig from "eslint-config-prettier" // Для конфигурации Prettier

export default [
    {
        files: ["**/*.{js,mjs,cjs,ts}"], // Подключаем JavaScript и TypeScript файлы
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parser: tsParser, // Подключаем TypeScript парсер
        },
        plugins: {
            prettier: await import("eslint-plugin-prettier"), // Динамический импорт плагина Prettier
        },
        rules: {
            ...pluginJs.configs.recommended.rules, // Рекомендации для JS
            ...tseslint.configs.recommended.rules, // Рекомендации для TypeScript
            "prettier/prettier": ["warn"], // Правила Prettier
        },
    },
    prettierConfig, // Добавляем Prettier как конфигурацию
]
