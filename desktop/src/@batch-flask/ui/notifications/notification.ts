import { SecureUtils } from "@batch-flask/utils";

export enum NotificationLevel {
    info = "info",
    error = "error",
    success = "success",
    warn = "warn",
}

export interface NotificationAction {
    name: string;
    do: () => void;
}

export interface NotificationConfig {
    /**
     * Time (in milliseconds) it take for the notification to disapear
     * automatically. Setting this value to 0 prevents the notification from
     * auto-dismissing. This is independent of the persist setting.
     * @default 3000
     */
    autoDismiss?: number;
    /**
     * If set to true the notification will be kept in the notification tray after it is dismissed automatically
     * @default false
     */
    persist?: boolean;

    /**
     * Optional action to do when clicking on the notification
     */
    action?: () => void;

    actions?: NotificationAction[];
}

const defaultConfig: NotificationConfig = {
    autoDismiss: 3000,
    persist: false,
    action: null,
    actions: [],
};

export class NotificationTimer {
    private _timerId: any;
    private _remaining: number;
    private _start: number;

    constructor(private callback: () => void, delay: number) {
        this._remaining = delay;
        this.resume();
    }

    public pause() {
        window.clearTimeout(this._timerId);
        this._remaining -= (new Date().getTime() - this._start);
    }

    public resume() {
        this._start = new Date().getTime();
        window.clearTimeout(this._timerId);
        this._timerId = window.setTimeout(this.callback, this._remaining);
    }

    public clear() {
        window.clearTimeout(this._timerId);
    }
}

/**
 * Notification model
 */
export class Notification {
    public id: string;
    public config: NotificationConfig;

    constructor(
        public level: NotificationLevel,
        public title: string,
        public message: string,
        config: NotificationConfig = {}) {

        this.id = SecureUtils.uuid();
        this.config = Object.assign({}, defaultConfig, config);
    }

}
