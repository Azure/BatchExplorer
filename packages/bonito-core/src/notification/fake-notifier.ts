import {
    Notifier,
    NotificationConfig,
    NotificationLevel,
    PendingNotification,
} from "./notifier";

export interface ExpectedNotification {
    level: NotificationLevel;
    notification: string;
    config: NotificationConfig;
}

export class FakeNotifier implements Notifier {
    expectedNotifications: ExpectedNotification[] = [];

    expectInfo(notification: string, config: NotificationConfig): void {
        this.addExpected("info", notification, config);
    }

    expectWarn(notification: string, config: NotificationConfig): void {
        this.addExpected("warn", notification, config);
    }

    expectInProgress(notification: string, config: NotificationConfig): void {
        this.addExpected("inprogress", notification, config);
    }

    expectSuccess(notification: string, config: NotificationConfig): void {
        this.addExpected("success", notification, config);
    }

    expectError(notification: string, config: NotificationConfig): void {
        this.addExpected("error", notification, config);
    }

    addExpected(
        level: NotificationLevel,
        expectedNotification: string,
        config: NotificationConfig
    ): void {
        this.expectedNotifications.push({
            level: level,
            notification: expectedNotification,
            config: config,
        });
    }

    protected _notify(
        level: NotificationLevel,
        title: string,
        description: string
    ): void {
        switch (level) {
            case "warn":
                this._popAndAssert("warn", title, description);
                break;
            case "inprogress":
                this._popAndAssert("inprogress", title, description);
                break;
            case "success":
                this._popAndAssert("success", title, description);
                break;
            case "error":
                this._popAndAssert("error", title, description);
                break;
            case "info":
            default:
                this._popAndAssert("info", title, description);
        }
    }

    private formatTextNotificationMessage(
        title: string,
        description: string
    ): string {
        return `${title} : ${description}`;
    }

    clearExpected(): void {
        this.expectedNotifications = [];
    }

    private _popAndAssert(
        level: NotificationLevel,
        title: string,
        description: string
    ) {
        const expected = this.popExpected();
        const formattedNotification = this.formatTextNotificationMessage(
            title,
            description
        );
        if (
            expected.level !== level ||
            expected.notification !== formattedNotification
        ) {
            throw new Error(
                `Expected message did not match actual.\n\nExpected:\n${FakeNotifier._formatSummary(
                    expected.level,
                    expected.notification
                )}\n\nActual:\n${FakeNotifier._formatSummary(
                    level,
                    formattedNotification
                )}`
            );
        }
    }

    private static _formatSummary(
        level: NotificationLevel,
        notification: string
    ): string {
        return `${level} | ${notification}`;
    }

    popExpected(): ExpectedNotification {
        const expected = this.expectedNotifications.shift();
        if (!expected) {
            throw new Error("No more expected messages");
        }
        return expected;
    }

    info(title: string, description: string): void {
        this._notify("info", title, description);
    }

    warn(title: string, description: string): void {
        this._notify("warn", title, description);
    }

    inProgress(title: string, description: string): PendingNotification {
        this._notify("inprogress", title, description);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return { id: "12345", update: () => {}, complete: () => {} };
    }

    success(title: string, description: string): void {
        this._notify("success", title, description);
    }

    error(title: string, description: string): void {
        this._notify("error", title, description);
    }
}
