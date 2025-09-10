const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es6
      }
    },
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_'}],
      'max-len': ['error', {'code': 120}],
      'valid-jsdoc': 'off',
      'new-cap': 'off'
    }
  }
];
