import { initMockEnvironment } from "../../environment";
import { createConsoleLogger } from "../console-logger";
import { getLogger } from "../logging-util";

describe("ConsoleLogger tests", () => {
    let debugMock: jest.SpyInstance;
    let warnMock: jest.SpyInstance;
    let errorMock: jest.SpyInstance;
    let infoMock: jest.SpyInstance;

    beforeEach(() => {
        initMockEnvironment(
            {},
            {
                loggerFactory: () => createConsoleLogger,
            }
        );

        debugMock = jest.spyOn(console, "debug").mockImplementation(() => {
            /* no-op */
        });
        warnMock = jest.spyOn(console, "warn").mockImplementation(() => {
            /* no-op */
        });
        errorMock = jest.spyOn(console, "error").mockImplementation(() => {
            /* no-op */
        });
        infoMock = jest.spyOn(console, "info").mockImplementation(() => {
            /* no-op */
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Log at each level", async () => {
        const logger = getLogger("test-levels");

        logger.info("log at info");
        expect(infoMock).toBeCalledWith(
            "[test-levels] - log at info",
            undefined
        );

        logger.debug("log at debug");
        expect(debugMock).toBeCalledWith(
            "[test-levels] - log at debug",
            undefined
        );

        logger.warn("log at warn");
        expect(warnMock).toBeCalledWith(
            "[test-levels] - log at warn",
            undefined
        );

        logger.error("log at error");
        expect(errorMock).toBeCalledWith(
            "[test-levels] - log at error",
            undefined
        );

        infoMock.mockReset();
        logger.info(
            {
                area: "test-area",
                instance: "test-instance",
                message: "log with context",
                errorCode: 1234,
            },
            "2ndArg",
            "3rdArg"
        );
        expect(infoMock).toBeCalledWith(
            "[test-area test-instance] - log with context",
            ["2ndArg", "3rdArg"]
        );
    });
});
