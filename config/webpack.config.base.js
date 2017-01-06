const baseConfig = {
    entry: {
        "polyfills": "./app/polyfills.browser",
        "app": "./app/app",
    },

    resolve: {
        extensions: ["", ".ts", ".js", ".json", ".scss", ".css", ".html"],
        modulesDirectories: [".", "node_modules"],
    },

    module: {
        loaders: [{
            test: /\.ts$/,
            loaders: ["ts", "angular2-template-loader"],
            exclude: [/node_modules/],
        },
        {
            test: /\.scss$/,
            loader: "style!css!sass",
            exclude: [/node_modules/],
        },
        {
            test: /\.html$/,
            loader: "raw",
            exclude: [/node_modules/],
        },
        {
            test: /\.json$/,
            loader: "raw",
            exclude: [],
        },
        {
            test: /node_modules.*\.css$/,
            loader: "raw",
        }],
    },
    target: "electron-renderer",
};


module.exports = baseConfig;
