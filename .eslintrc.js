module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  rules: {
    'linebreak-style': [2, 'unix'],
    quotes: [1, 'single'],
    'no-console': [0],
    'no-extra-semi': [0],
    'no-unused-vars': [1],
    semi: [1, 'never'],
  },
  globals: {
    chrome: false,
    configManager: true,
    proxy: true,
    unlocker: true,
  },
}
