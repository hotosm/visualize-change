const config = require("./webpack.common");
const path = require("path");

const DIST = path.resolve(__dirname, "dist");

module.exports = Object.assign({}, config, {
  devServer: {
    publicPath: "/",
    contentBase: DIST
  },
  devtool: "source-map"
});
