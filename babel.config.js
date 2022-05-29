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
  plugins: [
    '@babel/transform-runtime',
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": true }]
  ]
}
