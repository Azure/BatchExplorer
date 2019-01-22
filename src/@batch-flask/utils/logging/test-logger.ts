import { Logger } from "./base-logger";

export class TestLogger implements Logger {
    public log(level: string, message: string, ...params: any[]) {
        // Nothing
    }
    public debug(message: string, ...params: any[]) {
        // Nothing
    }
    public info(message: string, ...params: any[]) {
        // Nothing
    }
    public warn(message: string, params?: any) {
        // Nothing
    }
    public error(message: string, error?: any) {
        // tslint:disable-next-line:no-console
        console.error(message, error);
    }
}
