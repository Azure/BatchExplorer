export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
    log(level: LogLevel, message: string, ...params: any[]): void;
    debug(message: string, ...params: any[]): void;
    info(message: string, ...params: any[]): void;
    warn(message: string, params?: any): void;
    error(message: string, error?: any): void;
}
