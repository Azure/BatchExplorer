export type LogLevel = "info" | "debug" | "warn" | "error";

export type LoggerFactory = (context: string | LoggingContext) => Logger;

export interface Logger {
    readonly context: LoggingContext;

    /**
     * Log out a message at info level
     *
     * @param message Either a string message or an object which may override
     *                parts of the logging context
     * @param params  Extra values to include in the message. Generally these
     *                will be cast to strings.
     */
    info(message: string | LogMessageInContext, ...params: unknown[]): void;

    debug(message: string | LogMessageInContext, ...params: unknown[]): void;

    warn(message: string | LogMessageInContext, ...params: unknown[]): void;

    error(message: string | LogMessageInContext, ...params: unknown[]): void;
}

export type LoggingContext = {
    /**
     * A named area to log messages under. This could be a class name,
     * a UI component name, etc.
     */
    readonly area: string;

    /**
     * An optional name to pass which specifically tracks a given invocation of
     * a function, a specific instance of a class, etc. For example,
     * this could be used to associate an ID across an HTTP request/response.
     */
    readonly instance?: string;

    /**
     * The timestamp of messages logged under this context.
     * If undefined, the current system time will be used.
     */
    readonly timestamp?: Date;

    /**
     * A numeric error code accompanying an error or warning log message.
     */
    readonly errorCode?: number;
};

export type LogMessageInContext = Partial<LoggingContext> & {
    message: string;
};
