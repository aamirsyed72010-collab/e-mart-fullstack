module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'google',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'max-len': ['error', {'code': 120}],

    'valid-jsdoc': 0,
    'new-cap': 0,
  },
};
