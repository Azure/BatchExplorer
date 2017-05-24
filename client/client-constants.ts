import * as path from "path";

/**
 * Root of BatchLabs(This is relative to where this file is when in the build folder)
 */
const root = path.join(__dirname, "../..");

// tslint:disable-next-line:no-var-requires
const packageConfig = require(`${root}/package.json`);

const urls = {
    main: {
        dev: "http://localhost:3178/index.html",
        prod: `file://${__dirname}/../../build/index.html`,
    },
    splash: {
        dev: `file://${root}/client/splash-screen/splash-screen.html`,
        prod: `file://${root}/build/client/splash-screen/splash-screen.html`,
    },
    recover: {
        dev: `file://${root}/client/recover-window/recover-window.html`,
        prod: `file://${root}/build/client/recover-window/recover-window.html`,
    },
    icon: __dirname + "/../assets/images/labs.ico",
};

export const Constants = {
    root,
    urls,
    version: packageConfig.version,
};
