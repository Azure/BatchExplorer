import * as bunyan from "bunyan";

// import { Constants } from "../client-constants";
import { Logger } from "./base-logger";
import { PrettyStream } from "./pretty-stream";

const stream = new PrettyStream();
stream.pipe(process.stderr);

export interface NodeLoggerConfig {
    name: string;
    path: string;
}

/**
 * Logger helper class that will log
 */
export class NodeLogger implements Logger {
    private static _mainLogger: NodeLogger;
    public static set mainLogger(logger: NodeLogger) {
        this._mainLogger = logger;
    }

    public static get mainLogger() {
        if (!this._mainLogger) {
            throw new Error("Main logger has not been set yet. Call NodeLogger.mainLogger = myLogger");
        }
        return this._mainLogger;
    }

    private _logger: bunyan;

    constructor(config: NodeLoggerConfig) {
        if (!config) {
            throw new Error("Missing configuration for Logger");
        }

        this._logger = bunyan.createLogger({
            name: config.name,
            level: "debug",
            streams: [
                {
                    stream: stream as any,
                },
                {
                    type: "rotating-file",
                    path: config.path,
                    period: "1d",       // daily rotation
                    count: 3,           // keep 3 back copies
                },
            ],
        });
    }

    /**
     * Doesn't not log to the console
     */
    public trace(message: string) {
        this._logger.trace(message);
    }

    public debug(message: string, ...params: any[]) {
        this._logger.debug(message, ...params);
    }

    public info(message: string, ...params: any[]) {
        this._logger.info(message, ...params);
    }

    public warn(message: string, params?: any) {
        this._logger.warn({ warn: { ...params } }, message);
    }

    public error(message: string, error?: any) {
        this._logger.error({ err: { ...error } }, message);
    }
}
