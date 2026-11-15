// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/', 'dist-web/'],
  },
  {
    rules: {
      // Import CSS (global.css Nativewind & CSS Modules di web) tidak perlu di-resolve oleh ESLint
      'import/no-unresolved': ['error', { ignore: ['.*\\.css$'] }],
    },
  },
]);
