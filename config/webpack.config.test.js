const config = require("./webpack.config.base");

// We need to remove the app entry from the default config as this is defined in karma
config.entry = {
    // 'polyfills': './app/polyfills.browser',
};

config.devtool = "inline-source-map";

module.exports = config;
