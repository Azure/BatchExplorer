const webpack = require("webpack");

const baseConfig = {
    entry: {
        "polyfills": "./app/polyfills.browser",
        "app": "./app/app",
    },

    resolve: {
        extensions: [".ts", ".js", ".json", ".scss", ".css", ".html"],
        modules: [".", "node_modules"],
    },

    module: {
        rules: [{
            test: /\.ts$/,
            loaders: ["ts-loader", "angular2-template-loader"],
            exclude: [/node_modules/],
        },
        {
            test: /\.scss$/,
            loader: "style-loader!css-loader!sass-loader",
            exclude: [/node_modules/],
        },
        {
            test: /\.html$/,
            loader: "raw-loader",
            exclude: [/node_modules/],
        },
        {
            test: /\.json$/,
            loader: "raw-loader",
            exclude: [],
        },
        {
            test: /node_modules.*\.css$/,
            loader: "raw-loader",
        }],
    },
    plugins: [
        // Workaround for WARNING Critical dependency: the request of a dependency is an expression
        new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/, __dirname),
    ],
    target: "electron-renderer",
};

module.exports = baseConfig;
