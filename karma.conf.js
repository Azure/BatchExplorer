const webpackConfig = require("./config/webpack.config.test");

// Karma config for testing the code running the browser environemnt.
// For the client testing use the mocha command line.
module.exports = function(config) {
    config.set({
        basePath: ".",
        frameworks: ["jasmine"],
        files: [
            { pattern: "./config/karma.shim.js", watched: false },
        ],

        // proxied base paths
        proxies: {
        },

        port: 9876,

        logLevel: config.LOG_INFO,
        browserConsoleLogOptions: {
            level: "log",
        },
        colors: true,

        autoWatch: false,
        autoWatchBatchDelay: 1000,

        browsers: ["CustomElectron"],
        customLaunchers: {
            CustomElectron: {
                base: "Electron",
                flags: ["--show", "--enable-precise-memory-info"]
            }
        },
        electronOpts: {
            title: "Banana",
            "webPreferences": {
                "blinkFeatures": "PreciseMemoryInfo"
            }
        },
        // Karma plugins loaded
        plugins: [
            "karma-jasmine",
            // "karma-coverage",
            "karma-jasmine-html-reporter",
            "karma-sourcemap-loader",
            "karma-mocha-reporter",
            "karma-electron",
            "karma-webpack",
        ],

        // Coverage reporter generates the coverage
        reporters: ["mocha"],

        preprocessors: {
            "config/karma.shim.js": ["webpack", "sourcemap", "electron"],
        },
        client: {
            useIframe: false,
        },
        webpack: webpackConfig,
        webpackMiddleware: {
            stats: "errors-only",
        },
        browserDisconnectTimeout: "4000",
        singleRun: true,
        mochaReporter: {
            output: "autowatch",
            reportSlowerThan: 200,
        },
    });
};
