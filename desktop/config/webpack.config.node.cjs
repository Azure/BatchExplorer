const config = require("./webpack.config.base.cjs");
const helpers = require("./helpers.cjs");
const { mergeWithCustomize, unique } = require("webpack-merge");
const { AngularWebpackPlugin } = require("@ngtools/webpack");

module.exports = mergeWithCustomize({
    customizeArray: unique(
      "plugins",
      ["AngularWebpackPlugin"],
      (plugin) => plugin.constructor && plugin.constructor.name,
    ),
})(config, {
    mode: "development",
    target: "electron-main",
    node: {
        __dirname: false,
    },
    entry: {
        main: "./src/client/main.ts",
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                loader: "node-loader",
            },
        ],
    },
    plugins:[
        new AngularWebpackPlugin({
            // skipCodeGeneration: !AOT,
            tsconfig: "./tsconfig.node.json",
            // mainPath: "./src/app/app.ts",              // will auto-detect the root NgModule.
            compilerOptions:{
                sourceMap: true,
            }
            // forkTypeChecker: !AOT,
        }),
    ],
    output: {
        path: helpers.root("build/client-test"),

        /**
         * Specifies the name of each output file on disk.
         * IMPORTANT: You must not specify an absolute path here!
         *
         * @see http://webpack.github.io/docs/configuration.html#output-filename
         */
        filename: "[name].[chunkhash].bundle.js",


        /**
         * The filename of non-entry chunks as relative path
         * inside the output.path directory.
         *
         * @see http://webpack.github.io/docs/configuration.html#output-chunkfilename
         */
        chunkFilename: "[id].[chunkhash].chunk.js"
    },
});

console.log(module.exports)
