export type LogLevel = "info" | "debug" | "warn" | "error";

export interface Logger {
    info(message: string): void;

    debug(message: string): void;

    warn(message: string): void;

    error(message: string): void;
    error<T extends Error>(message: string, error: T): void;
}
