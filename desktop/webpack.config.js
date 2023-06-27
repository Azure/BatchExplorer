
// Look in ./config folder for webpack.dev.js
switch (process.env.NODE_ENV) {
    case "prod":
    case "production":
        module.exports = require("./config/webpack.config.prod");
        break;
    case "test":
    case "testing":
        module.exports = require("./config/webpack.config.test");
        break;
    case "dev":
    case "development":
    default:
        module.exports = require("./config/webpack.config.dev");
}
