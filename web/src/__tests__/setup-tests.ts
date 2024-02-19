import { destroyEnvironment } from "@azure/bonito-core";
import {
    initializeAxe,
    mockJsdomMissingAPIs,
} from "@azure/bonito-ui/lib/test-util";

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
jest.setTimeout(30000);

// KLUDGE: Mock out the monaco API so that imports to MonacoEditor do not error.
// Note that the editor itself currently does not work in a Node.js
// environment regardless
jest.mock("monaco-editor/esm/vs/editor/editor.api", () => {
    return {};
});
