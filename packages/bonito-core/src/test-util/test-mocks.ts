import { Blob as NodeBlob } from "node:buffer";

export function mockNodeTestMissingAPIs() {
    // Blob is not supported in global in jest in node.
    // May be able to use jsdom instead when this issue is resolved:
    // https://github.com/jsdom/jsdom/issues/2555
    globalThis.Blob = NodeBlob as unknown as typeof globalThis.Blob;

    // Fetch is not supported in global in jest in node.
    // Adding it here allows it to be stubbed by Jest
    // https://stackoverflow.com/questions/74945569/cannot-access-built-in-node-js-fetch-function-from-jest-tests
    globalThis.fetch = () => {
        throw new Error("Fetch is not supported in tests and must be stubbed.");
    };
}
