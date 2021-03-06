import {
    fromIso,
    getLocalTimeZoneOffset,
    setLocalTimeZoneOffset,
    toIsoLocal,
} from "../../datetime";
import { destroyEnvironment } from "../environment-util";
import { MockLogger } from "../../logging";
import { getMockEnvironment, initMockEnvironment } from "../environment-util";

describe("Mock environment tests", () => {
    test("Can reset the environment without destroying/recreating it", () => {
        initMockEnvironment();
        const env = getMockEnvironment();
        expect(env.uniqueId()).toBe(0);
        expect(env.uniqueId()).toBe(1);
        env.reset();
        expect(env.uniqueId()).toBe(0);
    });

    test("Default mock environment uses a mock logger", () => {
        initMockEnvironment();
        const env = getMockEnvironment();
        const mockLogger = env.getLogger() as MockLogger;
        mockLogger.expectInfo("This is from a mock logger");
        mockLogger.info("This is from a mock logger");
    });

    test("Environment variable are loaded into config object", () => {
        try {
            process.env._BE_TEST_ENV_VAR = "testvalue";
            initMockEnvironment();
            const env = getMockEnvironment();
            expect(env.config.envVars?._BE_TEST_ENV_VAR).toBe("testvalue");
        } finally {
            process.env._BE_TEST_ENV_VAR = undefined;
        }
    });

    test("Mock environment sets a hard-coded timezone offset of -3", () => {
        // Store the system's offset before the mock environment changes it
        const systemOffset = getLocalTimeZoneOffset();

        initMockEnvironment();

        expect(getLocalTimeZoneOffset()).toBe(-3);
        expect(toIsoLocal(fromIso("2020-12-03T12:00:00.000Z"))).toBe(
            "2020-12-03T09:00:00.000-03:00"
        );
        // If we happen to be in the -3 timezone offset, use -2 instead
        if (systemOffset === -3) {
            setLocalTimeZoneOffset(-2);
            expect(getLocalTimeZoneOffset()).toBe(-2);
            expect(toIsoLocal(fromIso("2020-12-03T12:00:00.000Z"))).toBe(
                "2020-12-03T10:00:00.000-02:00"
            );
        }
        destroyEnvironment();

        // System offset should be restored
        expect(getLocalTimeZoneOffset()).toBe(systemOffset);
    });
});
