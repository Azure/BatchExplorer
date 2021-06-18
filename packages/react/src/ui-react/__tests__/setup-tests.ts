import { destroyEnvironment } from "@batch/ui-common";
import { initializeAxe } from "../test-util/a11y";

beforeAll(async () => {
    await initializeAxe();
});

afterEach(() => {
    destroyEnvironment();
});
