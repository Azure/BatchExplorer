const webpackConfig = require("./config/webpack.config.test");

// Only enable coverage if env is defined(So we don't enable it in watch mode as it duplicate logs)
const coverageReporters = process.env.COVERAGE ? ["coverage", "remap-coverage"] : [];
// Karma config for testing the code running the browser environemnt.
// For the client testing use the mocha command line.
module.exports = function(config) {
    config.set({
        basePath: ".",
        frameworks: ["jasmine"],
        files: [{
            pattern: "./test/app/spec-entry.js",
            watched: false
        }, ],

        // proxied base paths
        proxies: {},

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

        // Coverage reporter generates the coverage
        reporters: ["mocha", ...coverageReporters],

        preprocessors: {
            "test/app/spec-entry.js": ["coverage", "webpack", "sourcemap", "electron"],
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
        coverageReporter: {
            type: "in-memory"
        },
        remapCoverageReporter: {
            "text-summary": null,
            json: "./coverage/coverage.json",
            html: "./coverage/html"
        },
    });
};
