/* eslint-disable @typescript-eslint/no-empty-function */
import { Blob as NodeBlob } from "node:buffer";

// some JSDOM APIs are not implemented, so we need to mock them
// to make UI tests work with JSDOM
export function mockJsdomMissingAPIs() {
    // make importing monaco-editor works
    // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    Object.defineProperty(globalThis, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {}, // deprecated
            removeListener: () => {}, // deprecated
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {},
        }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.HTMLCanvasElement.prototype.getContext = () => ({} as any);

    // May be able to use jsdom instead when this issue is resolved:
    // https://github.com/jsdom/jsdom/issues/2555
    globalThis.Blob = NodeBlob as unknown as typeof globalThis.Blob;

    // Fetch is also not implemented in jsdom. Adding it here allows it
    // to be stubbed by Jest
    globalThis.fetch = () => {
        throw new Error("Fetch is not supported in tests and must be stubbed.");
    };
}
