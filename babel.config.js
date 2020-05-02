module.exports = {
  presets: [
    '@babel/env',
    [
      '@nuxt/babel-preset-app',
      {
        corejs: { version: 3 },
        useBuiltIns: 'entry'
      }
    ]
  ],
  plugins: ['@babel/transform-runtime']
}
