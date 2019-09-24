const StatsPlugin = require('stats-webpack-plugin')

module.exports = {
  pluginOptions: {
    express: {
      shouldServeApp: true,
      serverDir: './srv'
    }
  },
  css: {
    loaderOptions: {
      postcss: {
        sourceMap: false,
        plugins: [
          require('cssnano')({ preset: 'default' })
        ]
      }
    }
  },
  configureWebpack: {
    plugins: [new StatsPlugin('stats.json')],
    optimization: {
      splitChunks: {
        maxSize: 250000,
        chunks: 'all'
      }
    }
  }
}
