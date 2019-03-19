import { NodeLogger } from "./node-logger";

export interface LoggingOptions {
    main: NodeLogger;
    renderer: NodeLogger;
}

export let mainLogger: NodeLogger;
export let rendererLogger: NodeLogger;

export function configureLogging(options: LoggingOptions) {
    mainLogger = options.main;
    rendererLogger = options.renderer;

    if (process.versions.electron) {
        require("electron").ipcMain.on("SEND_LOG", (_, value) => {
            const params = value.params || [];
            rendererLogger.log(value.level, value.message, ...params);
        });
    }
}
