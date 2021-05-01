//
// Expose resolved webpack config for external tool · Issue #4286 · nuxt/nuxt.js
// https://github.com/nuxt/nuxt.js/issues/4286
//
// Usage: node -r esm bin/update-webpack-configs.js
// it generate bin/webpack.config.(server|client|.js : webpack config by nuxt.js
//

import fs from 'fs'
import path from 'path'

import { Nuxt, Builder } from 'nuxt'
import { BundleBuilder } from '@nuxt/webpack/dist/webpack'
import config from '../nuxt.config.js'

class CustomBundleBuilder extends BundleBuilder {
  constructor(context) {
    super(context)
    this.compilerMap = {}
  }

  /**
   * Skip running compiler and store compiler into compilerMap
   * @override
   */
  webpackCompile(compiler) {
    this.compilerMap[compiler.name] = compiler
  }
}

const collectWebpackConfigs = async () => {
  const nuxt = new Nuxt(config)
  const customBuilder = new Builder(nuxt, CustomBundleBuilder)
  await customBuilder.build()
  customBuilder.close() // EDIT: By default nuxt.options is set for development, need to close builder to stop nuxt from watching for fileChange

  return customBuilder.bundleBuilder.compilerMap
}

const makeWebpackConfigName = (postFix) =>
  path.join(__dirname, 'webpack.config.' + postFix + '.js')
const outputConfigurationAsFile = ({ name, options }) => {
  const webpackFilePath = makeWebpackConfigName(name)
  const content = 'module.exports = ' + JSON.stringify(options)
  fs.writeFileSync(webpackFilePath, content)
}
const processWebpackCompilerMap = (webpackCompilerMap) => {
  Object.entries(webpackCompilerMap).forEach(([name, compiler]) => {
    outputConfigurationAsFile({ name, options: compiler.options })
  })
}

collectWebpackConfigs()
  .then(processWebpackCompilerMap)
  .then(() => process.exit())
