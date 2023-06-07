import {
    Notification,
    NotificationConfig,
    LinkToReference,
    PendingNotification,
} from "./notification";

export class MockNotifier implements Notification {
    info(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void {
        alert(`[info] ${title} : ${description}`);
    }

    warn(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void {
        alert(`[warn] ${title} : ${description}`);
    }

    inProgress(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        percentComplete?: number,
        config?: NotificationConfig
    ): PendingNotification {
        alert(`[inprogress] ${title} : ${description}`);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return { id: "", update: () => {}, complete: () => {} };
    }

    success(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void {
        alert(`[success] ${title} : ${description}`);
    }

    error(
        title: string,
        description: string,
        linkTo?: LinkToReference,
        config?: NotificationConfig
    ): void {
        alert(`[error] ${title} : ${description}`);
    }
}
