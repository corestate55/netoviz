module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'standard',
    'plugin:vue/recommended',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/v-bind-style': ['error', 'longform'],
    'vue/v-on-style': ['error', 'longform']
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
