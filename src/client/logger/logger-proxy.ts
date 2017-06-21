import * as bunyan from "bunyan";
import { app } from "electron";
import * as mkdirp from "mkdirp";
import * as path from "path";

import { Constants } from "../client-constants";

const logsFolder = Constants.isAsar ? path.join(app.getPath("userData"), "logs") : path.join(Constants.root, "logs");

mkdirp.sync(logsFolder);

export const logger = bunyan.createLogger({
    name: "BatchLabs Main",
    level: "debug",
    streams: [
        { stream: process.stderr },
        {
            type: "rotating-file",
            path: path.join(logsFolder, "client.log"),
            period: "1d",       // daily rotation
            count: 3,           // keep 3 back copies
        },
    ],
});

export const renderLogger = bunyan.createLogger({
    name: "BatchLabs Render",
    level: "debug",
    streams: [
        { stream: process.stderr },
        {
            type: "rotating-file",
            path: path.join(logsFolder, "app.log"),
            period: "1d",       // daily rotation
            count: 3,           // keep 3 back copies
        },
    ],
});
