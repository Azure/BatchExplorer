const config = require("./webpack.config.base");
const webpack = require("webpack");
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

// We need to remove the app entry from the default config as this is defined in karma
delete config.entry;

config.devtool = "inline-source-map";

// Karma webpack doesn't support CommonChunkPlugin yet https://github.com/webpack-contrib/karma-webpack/issues/24
config.plugins = config.plugins.filter(x => !(x instanceof CommonsChunkPlugin));
module.exports = config;
