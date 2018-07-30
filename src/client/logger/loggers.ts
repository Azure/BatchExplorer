import * as path from "path";

import { NodeLogger } from "@batch-flask/utils/logging/node-logger";
import { Constants } from "../client-constants";

const logsFolder = Constants.logsFolder;

export const logger = new NodeLogger({
    name: "BatchExplorer Main",
    path: path.join(logsFolder, "client.log"),
});

export const pythonLogger = new NodeLogger({
    name: "BatchExplorer Python",
    path: path.join(logsFolder, "python-server.log"),
});

export const renderLogger = new NodeLogger({
    name: "BatchExplorer Renderer",
    path: path.join(logsFolder, "app.log"),
});

export function initLogger() {
    NodeLogger.mainLogger = logger;
}
