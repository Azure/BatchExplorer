import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import * as Transport from "winston-transport";

// import { Constants } from "../client-constants";
import { SanitizedError } from "../error";
import { Logger } from "./base-logger";
import { PrettyStream } from "./pretty-stream";

const stream = new PrettyStream();
stream.pipe(process.stderr);

export interface NodeLoggerConfig {
    name: string;
    path?: string;
    json?: boolean;
}

/**
 * Logger helper class that will log
 */
export class NodeLogger implements Logger {
    private _logger: winston.Logger;

    constructor(config: NodeLoggerConfig) {
        if (!config) {
            throw new SanitizedError("Missing configuration for Logger");
        }

        const transports: Transport[] = [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.label({ label: config.name, message: true }),
                    winston.format.colorize(),
                    winston.format.simple(),
                ),
            }),
        ];

        if (config.path) {

            let format;
            if (config.json) {
                format = winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                );
            } else {
                format = winston.format.simple();
            }

            transports.push(new DailyRotateFile({
                maxFiles: 3,
                filename: config.path,
                format,
            }));
        }
        this._logger = winston.createLogger({
            level: "debug",
            transports,
        });
    }

    public log(level: string, message: string, ...params: any[]) {
        this._logger.log(level, message, params);
    }
    public debug(message: string, ...params: any[]) {
        this._logger.debug(message, ...params);
    }

    public info(message: string, ...params: any[]) {
        this._logger.info(message, ...params);
    }

    public warn(message: string, ...params: any[]) {
        this._logger.warn(message, ...params);
    }

    public error(message: string, error?: any) {
        this._logger.error(message, error);
    }
}
