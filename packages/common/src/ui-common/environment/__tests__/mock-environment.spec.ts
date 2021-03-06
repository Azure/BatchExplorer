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
});
