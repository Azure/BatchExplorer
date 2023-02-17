import { AbstractLogger } from "./abstract-logger";
import { LogLevel } from "./logger";

export interface ExpectedMessage {
    level: LogLevel;
    message: string;
    args?: unknown[];
}

export class MockLogger extends AbstractLogger {
    /**
     * Enable only when specifically testing what messages are logged
     */
    enableChecking: boolean = false;

    expectedMessages: ExpectedMessage[] = [];

    expectInfo(expectedMsg: string, ...args: unknown[]): void {
        this.addExpected("info", expectedMsg, ...args);
    }

    expectDebug(expectedMsg: string, ...args: unknown[]): void {
        this.addExpected("debug", expectedMsg, ...args);
    }

    expectWarn(expectedMsg: string, ...args: unknown[]): void {
        this.addExpected("warn", expectedMsg, ...args);
    }

    expectError(expectedMsg: string, ...args: unknown[]): void {
        this.addExpected("error", expectedMsg, ...args);
    }

    addExpected(
        level: LogLevel,
        expectedMsg: string,
        ...args: unknown[]
    ): void {
        if (!this.enableChecking) {
            throw new Error(
                "Set `MockLogger.enableChecking = true` to enable log message assertions"
            );
        }
        this.expectedMessages.push({
            level: level,
            message: expectedMsg,
            args: args,
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
        ...args: unknown[]
    ): string {
        return `${level} | ${message}${args == null ? "" : args.join(" | ")}`;
    }

    private _popAndAssert(
        level: LogLevel,
        message: string,
        ...args: unknown[]
    ) {
        if (!this.enableChecking) {
            // If checking is not enabled, this is a no-op
            return;
        }
        const argsMatch = (
            expectedArgs?: unknown[],
            actualArgs?: unknown[]
        ) => {
            // If one is undefined or null, both must be
            if (expectedArgs == null || actualArgs == null) {
                return expectedArgs == null && actualArgs == null;
            }

            // Length mismatch is an automatic failure
            if (expectedArgs.length !== actualArgs.length) {
                return false;
            }

            // Check each arg
            for (let i = 0; i < expectedArgs.length; i++) {
                const expected = expectedArgs[i];
                const actual = actualArgs[i];
                if (expected instanceof Error) {
                    if (String(expected) !== String(actual)) {
                        return false;
                    }
                } else {
                    if (expected !== actual) {
                        return false;
                    }
                }
            }

            // All arguments matched
            return true;
        };

        const expected = this.popExpected();
        if (
            expected.level !== level ||
            expected.message !== message ||
            !argsMatch(expected.args, args)
        ) {
            throw new Error(
                `Expected message did not match actual.\n\nExpected:\n${MockLogger._formatSummary(
                    expected.level,
                    expected.message,
                    expected.args
                )}\n\nActual:\n${MockLogger._formatSummary(
                    level,
                    message,
                    args
                )}`
            );
        }
    }

    protected _log(level: LogLevel, message: string, ...args: unknown[]): void {
        switch (level) {
            case "debug":
                this._popAndAssert("debug", message, ...args);
                break;
            case "warn":
                this._popAndAssert("warn", message, ...args);
                break;
            case "error":
                this._popAndAssert("error", message, ...args);
                break;
            case "info":
            default:
                this._popAndAssert("info", message, ...args);
        }
    }
}
