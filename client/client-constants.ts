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
    icon: __dirname + "/../assets/images/icon.ico",
};

const isAsar = process.mainModule.filename.indexOf("app.asar") !== -1;

export const Constants = {
    isAsar,
    root,
    urls,
    version: packageConfig.version,
};
