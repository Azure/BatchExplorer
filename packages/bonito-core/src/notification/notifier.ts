export type NotificationLevel =
    | "info"
    | "warn"
    | "inprogress"
    | "success"
    | "error";

export type NotificationStatus = "success" | "error";

export interface Notifier {
    info(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void;

    warn(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void;

    inProgress(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        percentComplete?: number,
        config?: NotificationConfig
    ): PendingNotification;

    success(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void;

    error(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void;
}

export type PendingNotification = {
    /**
     * The notification's unique id.
     */
    readonly id: string;
    /**
     * Method to update pending notification
     */
    update: (
        title: string,
        description: string,
        linkTo?: LinkToReference,
        percentComplete?: number
    ) => void;
    /**
     * Method to complete pending notification with failure or success
     */
    complete: (
        level: NotificationLevel,
        title?: string,
        description?: string
    ) => void;
};

export interface LinkToReference {
    extensionName: string;
    bladeName: string;
    parameters?: Map<string, string>;
}
export interface NotificationConfig {
    autodismiss?: number;
    persist?: boolean;
    action?: () => void;
    actions?: NotificationAction[];
}
