import { FetchHttpClient } from "../fetch-http-client";
import { MockHttpResponse } from "../mock-http-client";

describe("FetchHttpClient", () => {
    beforeEach(() => {
        globalThis.fetch;
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
