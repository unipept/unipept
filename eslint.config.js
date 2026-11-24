import { defineConfig } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['dist/**', 'public/**', 'playwright-report/**', 'test-results/**'],
    },
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
            },
        },
    },
    {
        rules: {
            // Vue rules
            'vue/require-default-prop': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/html-indent': ['warn', 4],
            'vue/valid-v-slot': ['error', { allowModifiers: true }],

            // TypeScript rules
            '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        // Off until their findings are fixed, one PR per rule.
        rules: {
            'vue/html-closing-bracket-newline': 'off',
            'vue/html-closing-bracket-spacing': 'off',
            'vue/html-quotes': 'off',
            'vue/html-self-closing': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/mustache-interpolation-spacing': 'off',
            'vue/no-spaces-around-equal-signs-in-attribute': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/v-on-event-hyphenation': 'off',
            'vue/v-slot-style': 'off',
        },
    },
]);
