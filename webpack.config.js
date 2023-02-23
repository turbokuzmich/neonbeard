const { resolve } = require("path");

const cwd = process.cwd();
const src = "src";
const dist = "dist";
const widget = "widget.js";

module.exports = {
  entry: resolve(cwd, src, widget),
  mode: "production",
  output: {
    filename: widget,
    path: resolve(cwd, dist),
  },
};
