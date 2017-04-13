const DefinePlugin = require("webpack/lib/DefinePlugin");
const config = require("./webpack.config.base");
const webpack = require("webpack");
const helpers = require("./helpers");
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

const ENV = "test";

// We need to remove the app entry from the default config as this is defined in karma
delete config.entry;

config.devtool = "inline-source-map";

// Karma webpack doesn't support CommonChunkPlugin yet https://github.com/webpack-contrib/karma-webpack/issues/24
config.plugins = config.plugins.filter(x => !(x instanceof CommonsChunkPlugin)).concat([
    new DefinePlugin({
        "ENV": JSON.stringify(ENV),
    }),
]);
config.module.rules = config.module.rules.concat(
    [
        {
            test: /\.scss$/,
            loader: "style-loader!css-loader!sass-loader",
            exclude: [helpers.root("app", "components")]
        },
        {
            test: /\.scss$/,
            use: ["to-string-loader", "css-loader", "sass-loader"],
            include: [helpers.root("app", "components")]
        },
        {
            test: /node_modules.*\.css$/,
            loader: "style-loader!css-loader",
        }
    ]
);
module.exports = config;
