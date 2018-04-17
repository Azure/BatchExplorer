const DefinePlugin = require("webpack/lib/DefinePlugin");
const config = require("./webpack.config.base");
const webpack = require("webpack");
const helpers = require("./helpers");
const { commonRules, defineEnv } = require("./webpack.common");
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

const ENV = "test";

// We need to remove the app entry from the default config as this is defined in karma
delete config.entry;

config.devtool = "inline-source-map";

// Karma webpack doesn't support CommonChunkPlugin yet https://github.com/webpack-contrib/karma-webpack/issues/24
config.plugins = [
    defineEnv(ENV),
];
config.module.rules = config.module.rules = [
    {
        test: /\.ts$/,
        use: [
            {
                loader: "awesome-typescript-loader",
                query: {
                    /**
                     * Use inline sourcemaps for "karma-remap-coverage" reporter
                     */
                    sourceMap: false,
                    inlineSourceMap: true,
                    compilerOptions: {

                        /**
                         * Remove TypeScript helpers to be injected
                         * below by DefinePlugin
                         */
                        removeComments: true

                    }
                },
            },
            "angular2-template-loader",
        ],
        exclude: [/node_modules/],
    },
    ...commonRules,
].concat(
    [{
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader",
    },
    {
        test: /node_modules.*\.css$/,
        loader: "style-loader!css-loader",
    },
    /**
     * Instruments JS files with Istanbul for subsequent code coverage reporting.
     * Instrument only testing sources.
     *
     * See: https://github.com/deepsweet/istanbul-instrumenter-loader
     */
    {
        enforce: "post",
        test: /\.(js|ts)$/,
        loader: "istanbul-instrumenter-loader",
        include: [
            helpers.root("app"),
            helpers.root("src"),
        ],
        exclude: [
            helpers.root("src/test"),
            /\.(e2e|spec)\.ts$/,
            /node_modules/
        ]
    }
    ]
);

module.exports = config;
