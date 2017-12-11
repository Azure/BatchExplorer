import { app } from "electron";
import * as mkdirp from "mkdirp";
import * as net from "net";
import * as path from "path";
/**
 * Root of BatchLabs(This is relative to where this file is when in the build folder)
 */
const root = path.join(__dirname, "../..");
console.log("Root", root);

const portrange = 45032;
function getPort(port = portrange): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(port, (err) => {
            server.once("close", () => {
                resolve(port);
            });
            server.close();
        });
        server.on("error", (err) => {
            getPort(port + 1).then((x) => {
                resolve(x);
            });
        });
    });
}

// tslint:disable-next-line:no-var-requires
const packageConfig = require(`${root}/package.json`);

const urls = {
    main: {
        dev: "http://localhost:3178/index.html",
        prod: `file://${__dirname}/../../build/index.html`,
    },
    splash: {
        dev: `file://${root}/src/client/splash-screen/splash-screen.html`,
        prod: `file://${root}/build/client/splash-screen/splash-screen.html`,
    },
    recover: {
        dev: `file://${root}/src/client/recover-window/recover-window.html`,
        prod: `file://${root}/build/client/recover-window/recover-window.html`,
    },
    icon: __dirname + "/../assets/images/icon.ico",
};

const isAsar = process.mainModule.filename.indexOf("app.asar") !== -1;
const logsFolder = isAsar ? path.join(app.getPath("userData"), "logs") : path.join(root, "logs");

const resourcesFolder = isAsar ? path.normalize(path.join(root, "..")) : root;

mkdirp.sync(logsFolder);

const pythonServerPort = {
    dev: Promise.resolve(8765),
    prod: getPort(),
};

const customProtocolName = "ms-batchlabs";

const rendererEvents = {
    batchlabsLink: "batchlabs-link",
};
// tslint:disable-next-line:variable-name
export const Constants = {
    isAsar,
    isDev: !isAsar,
    root,
    urls,
    logsFolder,
    resourcesFolder,
    pythonServerPort,
    customProtocolName,
    rendererEvents,
    version: packageConfig.version,
};
