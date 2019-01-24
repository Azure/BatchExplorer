import { configureLogging } from "@batch-flask/utils/logging/configuration";
import { NodeLogger } from "@batch-flask/utils/logging/node-logger";
import * as path from "path";
import { Constants as ClientConstants } from "../client-constants";

const logsFolder = ClientConstants.logsFolder;

export const logger = new NodeLogger({
    name: "BatchExplorer Main",
    path: path.join(logsFolder, "client.log"),
});

export const pythonLogger = new NodeLogger({
    name: "BatchExplorer Python",
    path: path.join(logsFolder, "python-server.log"),
});

export const rendererLogger = new NodeLogger({
    name: "BatchExplorer Renderer",
    path: path.join(logsFolder, "app.log"),
});

export function initLogger() {
    configureLogging({
        main: logger,
        renderer: rendererLogger,
    });
}
