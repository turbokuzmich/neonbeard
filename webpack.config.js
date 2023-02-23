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
};
