import { destroyEnvironment } from "@batch/ui-common";
import { initializeAxe } from "@batch/ui-react/lib/test-util/a11y";

beforeAll(async () => {
    await initializeAxe();
});

afterEach(() => {
    jest.resetAllMocks();
    destroyEnvironment();
});

afterAll(() => {
    jest.restoreAllMocks();
});

// KLUDGE: Mock out the monaco API so that imports to MonacoEditor do not error.
// Note that the editor itself currently does not work in a Node.js
// environment regardless
jest.mock("monaco-editor/esm/vs/editor/editor.api", () => {
    return {};
});

// UI tests can be slow, especially with a11y tests enabled
jest.setTimeout(30000);
