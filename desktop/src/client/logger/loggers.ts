import { configureLogging } from "@batch-flask/utils/logging/configuration";
import { NodeLogger } from "@batch-flask/utils/logging/node-logger";
import * as path from "path";
import { Constants as ClientConstants } from "../client-constants";

const logsFolder = ClientConstants.logsFolder;

export const logger = new NodeLogger({
    name: "BatchExplorer Main",
    path: path.join(logsFolder, "client.log"),
    json: true,
});

export const pythonLogger = new NodeLogger({
    name: "BatchExplorer Python",
    path: path.join(logsFolder, "python-server.log"),
    json: false,
});

export const rendererLogger = new NodeLogger({
    name: "BatchExplorer Renderer",
    path: path.join(logsFolder, "app.log"),
    json: true,
});

export function initLogger() {
    configureLogging({
        main: logger,
        renderer: rendererLogger,
    });
}
