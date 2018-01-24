const config = require("./webpack.common");
const path = require("path");

const DIST = path.resolve(__dirname, "dist");

module.exports = Object.assign({}, config, {
  devServer: {
    publicPath: "/",
    contentBase: DIST,
    port: 3000,
    host: "0.0.0.0", // for docker
    // watchOptions: {
    //   poll: 1000 // for docker
    // }
  },
  devtool: "source-map"
});
