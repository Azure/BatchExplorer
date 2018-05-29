import { Logger } from "./base-logger";

export class TestLogger implements Logger {
    public trace(message: string) {
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
        // Nothing
    }
}
