import { destroyEnvironment } from "../environment";
import { Blob as NodeBlob } from "node:buffer";
import { Mutable } from "../types";

// May be able to use jsdom instead when this issue is resolved:
// https://github.com/jsdom/jsdom/issues/2555
globalThis.Blob = NodeBlob as unknown as typeof globalThis.Blob;

// Fetch is also not implemented in jsdom. Adding it here allows it
// to be stubbed by Jest
globalThis.fetch = () => {
    throw new Error("Fetch is not supported in tests and must be stubbed.");
};

// Create navigator object if it doesn't already exist in Node.js environment
if (!globalThis.navigator) {
    globalThis.navigator = {} as Mutable<Navigator>;
}

afterEach(() => {
    jest.resetAllMocks();
    destroyEnvironment();
});

afterAll(() => {
    jest.restoreAllMocks();
});
