import { destroyEnvironment } from "@batch/ui-common";

afterEach(() => {
    destroyEnvironment();
});

// KLUDGE: Mock out the monaco API so that imports to MonacoEditor do not error.
// Note that the editor itself currently does not work in a Node.js
// environment regardless
jest.mock("monaco-editor/esm/vs/editor/editor.api", () => {
    return {};
});
