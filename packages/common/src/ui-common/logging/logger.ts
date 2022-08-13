export type LogLevel = "info" | "debug" | "warn" | "error";

export interface Logger {
    info(message: string, ...args: unknown[]): void;

    debug(message: string, ...args: unknown[]): void;

    warn(message: string, ...args: unknown[]): void;

    error(message: string, ...args: unknown[]): void;
}
