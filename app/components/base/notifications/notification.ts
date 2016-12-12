import { SecureUtils } from "app/utils";

export type NotificationLevel = "info" | "warn" | "error" | "success";
export const NotificationLevel = {
    info: "info" as NotificationLevel,
    error: "error" as NotificationLevel,
    success: "success" as NotificationLevel,
};

export interface NotificationConfig {
    /**
     * Time(in seconds) it take for the notification to disapear automatically.
     * This is independent from the persist setting.
     * @default 5 seconds
     */
    autoDismiss?: number;
    /**
     * If set to true the notification will be kept in the notification tray after it is dismissed automatically
     * @default false
     */
    persist?: boolean;

    /**
     * Optional action
     */
    action?: Function;
}

const defaultConfig: NotificationConfig = {
    autoDismiss: 5,
    persist: false,
    action: null,
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
