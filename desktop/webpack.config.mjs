


let config;
// Look in ./config folder for webpack.dev.js
switch (process.env.NODE_ENV) {
    case "prod":
    case "production":
        config = import('./config/webpack.config.prod.mjs').then((module) => module.default);
        break;
    case "test":
    case "testing":
        config = import('./config/webpack.config.test.mjs').then((module) => module.default);
        break;
    case "dev":
    case "development":
    default:
        config = import('./config/webpack.config.dev.mjs').then((module) => module.default);
}

export default config;
