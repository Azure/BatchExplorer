/* eslint-disable @typescript-eslint/no-empty-function */

import { mockNodeTestMissingAPIs } from "@azure/bonito-core/lib/test-util/test-mocks";

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

    mockNodeTestMissingAPIs();
}
