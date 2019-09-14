const StatsPlugin = require('stats-webpack-plugin')
module.exports = {
  pluginOptions: {
    express: {
      shouldServeApp: true,
      serverDir: './srv'
    }
  },
  configureWebpack: {
    plugins: [new StatsPlugin('stats.json')]
  }
}
