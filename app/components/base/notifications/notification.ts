import { SecureUtils } from "app/utils";

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
     * Time(in milliseconds) it take for the notification to disapear automatically.
     * This is independent from the persist setting.
     * @default 3500ms
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
