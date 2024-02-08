import { destroyEnvironment } from "@azure/bonito-core";
import { initializeAxe } from "@azure/bonito-ui/lib/test-util/a11y";

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

// Hoppe TODO
// // KLUDGE: Mock out the monaco API so that imports to MonacoEditor do not error.
// // Note that the editor itself currently does not work in a Node.js
// // environment regardless
// jest.mock("monaco-editor/esm/vs/editor/editor.api", () => {
//     return {};
// });

// UI tests can be slow, especially with a11y tests enabled
jest.setTimeout(30000);
