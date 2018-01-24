const path = require("path");

const DIST = path.resolve(__dirname, "dist");

module.exports = {
  entry: "./src/index",
  output: {
    filename: "bundle.js",
    path: DIST
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["stage-1"],
          plugins: ["transform-react-jsx"]
        }
      }
    ]
  }
};
