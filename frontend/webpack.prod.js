// const MinifyPlugin = require('babel-minify-webpack-plugin');
const config = require("./webpack.common");
const webpack = require("webpack");

module.exports = Object.assign({}, config, {
  plugins: [
    ...config.plugins,

    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })

    // FIXME: using MinifyPlugin ends in "k is not defined" error
    // new MinifyPlugin({ removeConsole: true, removeDebugger: true }, { comments: false })
  ]
});
