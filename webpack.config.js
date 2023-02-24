const { resolve } = require("path");

const cwd = process.cwd();
const src = "src";
const dist = "dist";
const widget = "widget";
const index = "index.js";

module.exports = {
  entry: resolve(cwd, src, widget, index),
  mode: "production",
  output: {
    filename: "widget.js",
    path: resolve(cwd, dist),
  },
  module: {
    rules: [
      {
        test: /(src\/widget|components)/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  devtool: false,
};
