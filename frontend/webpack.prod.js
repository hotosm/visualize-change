const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const config = require("./webpack.common");
const webpack = require("webpack");

module.exports = Object.assign({}, config, {
  module: {
    ...config.module,

    // uglifyjs breaks mapbox
    noParse: /(mapbox-gl)\.js$/
  },

  plugins: [
    ...config.plugins,

    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),

    new UglifyJsPlugin({
      parallel: true,
      uglifyOptions: {
        compress: { inline: false }
      }
    })
  ]
});
