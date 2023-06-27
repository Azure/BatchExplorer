import { destroyEnvironment } from "../environment";
import { Blob as NodeBlob } from "node:buffer";

// May be able to use jsdom instead when this issue is resolved:
// https://github.com/jsdom/jsdom/issues/2555
globalThis.Blob = NodeBlob as unknown as typeof globalThis.Blob;

// Fetch is also not implemented in jsdom. Adding it here allows it
// to be stubbed by Jest
globalThis.fetch = () => {
    throw new Error("Fetch is not supported in tests and must be stubbed.");
};

afterEach(() => {
    jest.resetAllMocks();
    destroyEnvironment();
});

afterAll(() => {
    jest.restoreAllMocks();
});
