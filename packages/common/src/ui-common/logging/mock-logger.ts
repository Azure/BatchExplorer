import { AbstractLogger } from "./abstract-logger";
import { LogLevel } from "./logger";

export interface ExpectedMessage {
    level: LogLevel;
    message: string;
    error?: unknown;
}

export class MockLogger extends AbstractLogger {
    expectedMessages: ExpectedMessage[] = [];

    expectInfo(expectedMsg: string): void {
        this.addExpected("info", expectedMsg);
    }

    expectDebug(expectedMsg: string): void {
        this.addExpected("debug", expectedMsg);
    }

    expectWarn(expectedMsg: string): void {
        this.addExpected("warn", expectedMsg);
    }

    expectError<T extends Error>(expectedMsg: string, error?: T): void {
        this.addExpected("error", expectedMsg, error);
    }

    addExpected<T extends Error>(
        level: LogLevel,
        expectedMsg: string,
        error?: T
    ): void {
        this.expectedMessages.push({
            level: level,
            message: expectedMsg,
            error: error,
        });
    }

    clearExpected(): void {
        this.expectedMessages = [];
    }

    popExpected(): ExpectedMessage {
        const expected = this.expectedMessages.shift();
        if (!expected) {
            throw new Error("No more expected messages");
        }
        return expected;
    }

    private static _formatSummary(
        level: LogLevel,
        message: string,
        error?: unknown
    ): string {
        return `${level} | ${message}${
            error == null ? "" : ` | ${String(error)}`
        }`;
    }

    private _popAndAssert(level: LogLevel, message: string, error?: unknown) {
        const expected = this.popExpected();
        if (
            expected.level !== level ||
            expected.message !== message ||
            String(expected.error) !== String(error)
        ) {
            throw new Error(
                `Expected message did not match actual.\n\nExpected:\n${MockLogger._formatSummary(
                    expected.level,
                    expected.message,
                    expected.error
                )}\n\nActual:\n${MockLogger._formatSummary(
                    level,
                    message,
                    error
                )}`
            );
        }
    }

    protected _log(level: LogLevel, message: string): void;
    protected _log<T extends Error>(
        level: LogLevel,
        message: string,
        error: T
    ): void;
    protected _log(level: LogLevel, message: string, error?: unknown): void {
        switch (level) {
            case "debug":
                this._popAndAssert("debug", message);
                break;
            case "warn":
                this._popAndAssert("warn", message);
                break;
            case "error":
                this._popAndAssert("error", message, error);
                break;
            case "info":
            default:
                this._popAndAssert("info", message);
        }
    }
}
