import { destroyEnvironment } from "@batch/ui-common";
import { initializeAxe } from "../test-util/a11y";

beforeAll(async () => {
    await initializeAxe();
});

afterEach(() => {
    destroyEnvironment();
});

// UI tests can be slow, especially with a11y tests enabled
jest.setTimeout(10000);
