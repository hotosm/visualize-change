const path = require("path");
const webpack = require("webpack");

const DIST = path.resolve(__dirname, "dist");

module.exports = {
  entry: "./src/index",

  output: {
    filename: "bundle.js",
    path: DIST
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.MAPBOX_ACCESS_TOKEN": JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN)
    })
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: "url-loader"
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
