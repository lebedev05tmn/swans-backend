import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parser: tsParser,
        },
        plugins: {
            prettier: await import('eslint-plugin-prettier'),
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            'prettier/prettier': ['warn'],
        },
    },
    prettierConfig,
];
