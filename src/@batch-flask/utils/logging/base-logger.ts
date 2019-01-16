export interface Logger {
    debug(message: string, ...params: any[]);
    info(message: string, ...params: any[]);
    warn(message: string, params?: any);
    error(message: string, error?: any);
}
