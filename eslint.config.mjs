import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
    {
        files: ['**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tsEslint,
            prettier: prettierPlugin,
        },
        rules: {
            ...tsEslint.configs.recommended.rules,
            ...prettierConfig.rules,
            'prettier/prettier': ['error', { endOfLine: 'auto' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 0,
        },
    },
    {
        ignores: ['node_modules', 'dist', '*.d.ts'],
    },
];
