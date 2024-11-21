import { destroyEnvironment } from "@azure/bonito-core";
import { initializeAxe, mockJsdomMissingAPIs } from "../test-util";

beforeAll(async () => {
    await initializeAxe();
    mockJsdomMissingAPIs();
});

afterEach(() => {
    jest.resetAllMocks();
    destroyEnvironment();
});

afterAll(() => {
    jest.restoreAllMocks();
});

// UI tests can be slow, especially with a11y tests enabled
jest.setTimeout(10000);
