import js from '@eslint/js';
import stylisticEslint from '@stylistic/eslint-plugin';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  pluginChaiFriendly.configs.recommendedFlat,
  importPlugin.flatConfigs.recommended,
  {
    files: [ './**/*.{js,vue}' ],
    plugins: {
      '@stylistic': stylisticEslint,
      '@stylistic/js': stylisticEslint,
      'chai-friendly': pluginChaiFriendly
    },
    rules: {
      'indent': [ 'error', 2 ],
      'no-debugger': 'error',
      // -----------------------------------------
      // TODO: Change to 'error' or remove this block later
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-empty': 'warn',
      'vue/valid-template-root': 'warn',
      'vue/require-explicit-emits': 'warn',
      'vue/no-dupe-keys': 'warn',
      'vue/no-mutating-props': 'warn',
      'vue/no-unused-vars': 'warn',
      'vue/require-valid-default-prop': 'warn',
      // -----------------------------------------
      'vue/multi-word-component-names': 'off',
      '@stylistic/js/object-curly-spacing': [ 'warn', 'always' ],
      '@stylistic/js/array-bracket-spacing': [ 'warn', 'always' ],
      'quotes': [ 'warn', 'single', { avoidEscape: true } ],
      'import/no-unresolved': 'off',
      'import/named': 'warn',
      'import/order': [ 'warn', {
        groups: [
          'builtin',
          'external',
          'parent',
          'sibling',
          'index',
          'object'
        ],
        'newlines-between': 'always-and-inside-groups',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      } ]
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        '$': true,
        '_': true,
        'Config': true,
        'Cesium': true,
        'i18next': true,
        'mapCollection': true,
        'moduleCollection': true
      }
    }
  }
]
