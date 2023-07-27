import { destroyEnvironment } from "../environment";
import { Blob as NodeBlob } from "node:buffer";

/*
 * This CustomGlobal interface extends NodeJS.Global to add browser-specific
 * properties (window, navigator, fetch, Blob) for emulating a browser-like
 * environment in the tests.
 */
export interface CustomGlobal extends NodeJS.Global {
    window: Record<string, unknown>;
    navigator: {
        language: string;
    };
    fetch: () => void;
    Blob: typeof Blob;
}

declare const globalThis: CustomGlobal;

// May be able to use jsdom instead when this issue is resolved:
// https://github.com/jsdom/jsdom/issues/2555
globalThis.Blob = NodeBlob as unknown as typeof globalThis.Blob;

// Fetch is also not implemented in jsdom. Adding it here allows it
// to be stubbed by Jest
globalThis.fetch = () => {
    throw new Error("Fetch is not supported in tests and must be stubbed.");
};

globalThis.window = {};
globalThis.navigator = { language: "en-US" };

afterEach(() => {
    jest.resetAllMocks();
    destroyEnvironment();
});

afterAll(() => {
    jest.restoreAllMocks();
});
