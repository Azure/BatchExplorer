import { initMockEnvironment } from "../../environment";
import { getLogger } from "../logging-util";
import { MockLogger } from "../mock-logger";

describe("Logging Utilities", () => {
    let logger: MockLogger;

    beforeEach(() => {
        initMockEnvironment();
        logger = getLogger() as MockLogger;
    });

    test("Each logging function works as expected", () => {
        logger.expectInfo("This is an info message");
        logger.info("This is an info message");

        logger.expectDebug("This is a debug message");
        logger.debug("This is a debug message");

        logger.expectWarn("This is a warning message");
        logger.warn("This is a warning message");

        logger.expectError("This is an error message with no error obj");
        logger.error("This is an error message with no error obj");

        logger.expectError(
            "This is an error message with a fake error",
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
        logger.expectInfo("info");
        expect(logger.expectedMessages.length).toBe(1);
        logger.expectDebug("debug");
        expect(logger.expectedMessages.length).toBe(2);
        logger.expectError("error", new Error("Fake error"));
        expect(logger.expectedMessages.length).toBe(3);

        // Pop one off the stack
        logger.info("info");
        expect(logger.expectedMessages.length).toBe(2);

        // Unexpected message throws an error, but still pops the message
        // off the stack
        expect(() => logger.error("error", new Error("Fake error"))).toThrow();
        expect(logger.expectedMessages.length).toBe(1);

        // Add a few more, then remove all expected messages
        logger.expectInfo("one");
        logger.expectInfo("two");
        logger.expectInfo("three");
        expect(logger.expectedMessages.length).toBe(4);
        logger.clearExpected();
        expect(logger.expectedMessages.length).toBe(0);

        // Can continue to use the logger after clearing expected
        logger.expectInfo("info");
        logger.info("info");
    });
});
