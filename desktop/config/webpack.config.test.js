const config = require("./webpack.config.base");
const { commonRules, defineEnv } = require("./webpack.common");
const ENV = "test";

// We need to remove the app entry from the default config as this is defined in karma
delete config.entry;
config.mode = "development";
config.devtool = "inline-source-map";

// Karma webpack doesn't support CommonChunkPlugin yet https://github.com/webpack-contrib/karma-webpack/issues/24
config.plugins = [
    defineEnv(ENV),
];
config.module.rules = config.module.rules = [
    {
        test: /\.ts$/,
        use: [
            "@jsdevtools/coverage-istanbul-loader",
            {
                loader: "ts-loader",
                options: {
                    transpileOnly: true
                },
            },
            require.resolve("./angular-template-loader"),
        ],
        exclude: [/node_modules/, /\.node\.spec\.ts/],  // node.spec.ts are to be run in node environment
    },
    ...commonRules
].concat(
    [{
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
    },
    {
        test: /node_modules.*\.css$/,
        use: ["style-loader", "css-loader"],
    },
    /**
     * Instruments JS files with Istanbul for subsequent code coverage reporting.
     * Instrument only testing sources.
     *
     * See: https://github.com/deepsweet/istanbul-instrumenter-loader
     */
    ]
);

module.exports = config;
