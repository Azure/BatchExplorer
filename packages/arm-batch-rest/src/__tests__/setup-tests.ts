import { destroyEnvironment } from "@batch/ui-common";
import fetch, { Headers, Request, Response } from "node-fetch";

if (!("fetch" in globalThis)) {
    Object.assign(globalThis, { fetch, Headers, Request, Response });
}

afterEach(() => {
    destroyEnvironment();
});
