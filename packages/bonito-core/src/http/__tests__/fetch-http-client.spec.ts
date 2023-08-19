import { FetchHttpClient } from "../fetch-http-client";
import { HttpHeaders } from "../http-client";
import { MapHttpHeaders } from "../map-http-headers";
import { MockHttpResponse } from "../mock-http-client";

const RealHeaders = globalThis.Headers;

describe("FetchHttpClient", () => {
    beforeEach(() => {
        // KLUDGE: Since JSDom doesn't support the Fetch API,
        //         it doesn't have a Headers object, so define
        //         one just for this test.
        globalThis.Headers = FakeFetchHeaders;

        jest.spyOn(globalThis, "fetch").mockImplementation(
            async (input, init) => {
                if (typeof input !== "string") {
                    throw new Error("Only string urls are stubbed");
                }

                if (init?.body) {
                    return new MockHttpResponse(input, {
                        status: 200,
                        body: "fake response with body",
                        headers: {
                            "Content-Type": "text/plain",
                        },
                    }) as unknown as Response;
                }

                if (init?.headers) {
                    const headers = init?.headers as FakeFetchHeaders;
                    if (headers.has("x-ms-command-name")) {
                        return new MockHttpResponse(input, {
                            status: 200,
                            body:
                                "fake response with command name: " +
                                headers.get("x-ms-command-name"),
                            headers: {
                                "Content-Type": "text/plain",
                            },
                        }) as unknown as Response;
                    }
                }

                return new MockHttpResponse(input, {
                    status: 200,
                    body: "fake response",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                }) as unknown as Response;
            }
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
        globalThis.Headers = RealHeaders;
    });

    test("simple url request", async () => {
        const client = new FetchHttpClient();

        const response = await client.fetch("/dogs/parker");
        expect(await response.text()).toBe("fake response");
    });

    test("request using object", async () => {
        const client = new FetchHttpClient();

        const response = await client.get({
            url: "/dogs/parker",
            body: "foobar",
        });
        expect(await response.text()).toBe("fake response with body");
    });

    test("custom headers", async () => {
        const client = new FetchHttpClient();

        const response = await client.fetch("/dogs/parker", {
            metadata: {
                commandName: "GetDog",
            },
        });
        expect(await response.text()).toBe(
            "fake response with command name: GetDog"
        );
    });

    test("url is required", () => {
        const client = new FetchHttpClient();
        expect(
            client.get({
                method: "GET",
            })
        ).rejects.toEqual(new Error("Fetch failed: Must specify a URL"));
    });

    test("2 urls is invalid", () => {
        const client = new FetchHttpClient();
        expect(
            client.get("/one", {
                method: "GET",
                url: "/two",
            })
        ).rejects.toEqual(new Error("Fetch failed: Cannot specify two URLs"));
    });
});

/**
 * A very limited/incomplete fake for the fetch headers object, since JSDom
 * doesn't support the fetch API yet.
 */
export class FakeFetchHeaders implements Headers {
    private _mapHttpHeaders: MapHttpHeaders;

    constructor(headers?: HeadersInit) {
        const headersInit: Record<string, string> = {};

        if (headers && typeof headers === "object") {
            for (const entry of Object.entries(headers)) {
                const key = entry[0];
                const value = entry[1];
                if (typeof key === "string" && typeof value === "string") {
                    headersInit[key] = value;
                } else {
                    throw new Error(
                        "Fake fetch headers only supports string keys and values"
                    );
                }
            }
        }
        this._mapHttpHeaders = new MapHttpHeaders(headersInit);
    }
    append(name: string, value: string): void {
        this._mapHttpHeaders.append(name, value);
    }
    delete(name: string): void {
        this._mapHttpHeaders.delete(name);
    }
    get(name: string): string | null {
        return this._mapHttpHeaders.get(name);
    }
    has(name: string): boolean {
        return this._mapHttpHeaders.has(name);
    }
    set(name: string, value: string): void {
        this._mapHttpHeaders.set(name, value);
    }
    forEach(
        callbackfn: (value: string, key: string, parent: Headers) => void,
        thisArg?: unknown
    ): void {
        const cb = callbackfn as unknown as (
            value: string,
            key: string,
            parent: HttpHeaders
        ) => void;
        return this._mapHttpHeaders.forEach(cb);
    }
    entries(): IterableIterator<[string, string]> {
        throw new Error("Method not implemented.");
    }
    keys(): IterableIterator<string> {
        throw new Error("Method not implemented.");
    }
    values(): IterableIterator<string> {
        throw new Error("Method not implemented.");
    }
    [Symbol.iterator](): IterableIterator<[string, string]> {
        throw new Error("Method not implemented.");
    }
}
