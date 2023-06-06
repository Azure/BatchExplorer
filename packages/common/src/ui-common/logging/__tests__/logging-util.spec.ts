import { initMockEnvironment } from "../../environment";
import { formatTextLogMessage, getLogger } from "../logging-util";
import { MockLogger } from "../mock-logger";

describe("Logging utilities", () => {
    let logger: MockLogger;

    beforeEach(() => {
        initMockEnvironment();
        logger = getLogger("test") as MockLogger;
        logger.enableChecking = true;
    });

    test("Each logging function works as expected", () => {
        logger.expectInfo("[test] - This is an info message");
        logger.info("This is an info message");

        logger.expectDebug("[test] - This is a debug message");
        logger.debug("This is a debug message");

        logger.expectWarn("[test] - This is a warning message");
        logger.warn("This is a warning message");

        // Override instance
        logger.expectInfo("[test abcd] - Overrode instance");
        logger.info({ instance: "abcd", message: "Overrode instance" });

        // Override whole context
        logger.expectInfo("[top-secret #1234] - This uses some custom context");
        logger.info({
            area: "top-secret",
            instance: "#1234",
            message: "This uses some custom context",
        });

        logger.expectError(
            "[test] - This is an error message with no error obj"
        );
        logger.error("This is an error message with no error obj");

        logger.expectError(
            "[test] - This is an error message with a fake error",
            new Error("Fake log testing error")
        );
        logger.error(
            "This is an error message with a fake error",
            new Error("Fake log testing error")
        );
    });

    test("Can assert expected messages", () => {
        // Add a few expected messages
        expect(logger.expectedMessages.length).toBe(0);
        logger.expectInfo("[test] - info");
        expect(logger.expectedMessages.length).toBe(1);
        logger.expectDebug("[test] - debug");
        expect(logger.expectedMessages.length).toBe(2);
        logger.expectError("[test] - error", new Error("Fake error"));
        expect(logger.expectedMessages.length).toBe(3);

        // Pop one off the stack
        logger.info("info");
        expect(logger.expectedMessages.length).toBe(2);

        // Unexpected message throws an error, but still pops the message
        // off the stack
        expect(() => logger.error("error", new Error("Fake error"))).toThrow();
        expect(logger.expectedMessages.length).toBe(1);

        // Add a few more, then remove all expected messages
        logger.expectInfo("[test] - one");
        logger.expectInfo("[test] - two");
        logger.expectInfo("[test] - three");
        expect(logger.expectedMessages.length).toBe(4);
        logger.clearExpected();
        expect(logger.expectedMessages.length).toBe(0);

        // Can continue to use the logger after clearing expected
        logger.expectInfo("[test] - info");
        logger.info("info");

        // Can set up multiple expectations in order
        logger.expectInfo("[test] - first");
        logger.expectInfo("[test] - second");
        logger.expectInfo("[test] - third");
        logger.info("first");
        logger.info("second");
        logger.info("third");
    });

    test("Format log message as text", () => {
        // Area only
        expect(
            formatTextLogMessage("hello", {
                area: "test-area",
            })
        ).toEqual("[test-area] - hello");

        // Area + instance
        expect(
            formatTextLogMessage("hello", {
                area: "test-area",
                instance: "1234",
            })
        ).toEqual("[test-area 1234] - hello");
    });
});
