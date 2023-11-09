import { MockHttpClient, MockHttpResponse } from "../mock-http-client";

const mockResponses = {
    parker: () =>
        new MockHttpResponse("/dogs/parker", {
            status: 200,
            body: `{"name": "Parker", "breed": "Schnauzer"}`,
            headers: {
                "Content-Type": "application/json",
            },
        }),
    nutmeg: () =>
        new MockHttpResponse("/dogs/nutmeg", {
            status: 200,
            body: `{"name": "Nutmeg", "breed": "Shihpoo"}`,
            headers: {
                "Content-Type": "application/json",
            },
        }),
};

describe("MockHttpClient", () => {
    test("can Mock a single GET request", async () => {
        const client = new MockHttpClient();
        client.addExpected(mockResponses.parker());

        const response = await client.get("/dogs/parker");
        expect(await response.text()).toBe(
            `{"name": "Parker", "breed": "Schnauzer"}`
        );
    });

    test("can get response body as JSON", async () => {
        const client = new MockHttpClient();
        client.addExpected(mockResponses.parker());

        const response = await client.get("/dogs/parker");
        expect(await response.json()).toStrictEqual({
            name: "Parker",
            breed: "Schnauzer",
        });
    });

    test("can get response body as Blob", async () => {
        const client = new MockHttpClient();
        client.addExpected(mockResponses.parker());

        const response = await client.get("/dogs/parker");
        const blob = await response.blob();
        const textContent = await blob.text();
        expect(textContent).toBe(`{"name": "Parker", "breed": "Schnauzer"}`);
        expect(blob.type).toBe("application/json");
    });

    test("can get response body as ArrayBuffer", async () => {
        const client = new MockHttpClient();
        client.addExpected(mockResponses.parker());

        const response = await client.get("/dogs/parker");
        const buf = await response.arrayBuffer();
        expect(String.fromCharCode(...new Uint8Array(buf))).toStrictEqual(
            `{"name": "Parker", "breed": "Schnauzer"}`
        );
    });

    test("can't read a response body twice", async () => {
        const client = new MockHttpClient();
        client.addExpected(mockResponses.parker());

        const response = await client.get("/dogs/parker");

        // First read should succeed
        expect(await response.json()).toStrictEqual({
            name: "Parker",
            breed: "Schnauzer",
        });

        // Subsequent reads should fail
        try {
            await response.text();
            fail("Should have thrown an error reading the response body twice");
        } catch (e) {
            // Good
            expect(e).toBeInstanceOf(TypeError);
            expect(String(e)).toBe(
                "TypeError: Failed to get response text: body stream already read"
            );
        }
    });

    test("can mock fetch", async () => {
        const client = new MockHttpClient();

        client.addExpected(
            new MockHttpResponse("/whatmethod", {
                status: 200,
                body: "Method was a GET!",
            }),
            {
                method: "GET",
            }
        );

        expect(await (await client.fetch("/whatmethod")).text()).toBe(
            "Method was a GET!"
        );
    });

    test("response URL and request URL can be different", async () => {
        const client = new MockHttpClient();

        client.addExpected(
            new MockHttpResponse("https://contoso.net/foobar", {
                status: 200,
                body: "foobaz",
            }),
            {
                method: "GET",
                url: "/foobar",
            }
        );

        const response = await client.fetch("/foobar");
        expect(response.url).toBe("https://contoso.net/foobar");
        expect(await response.text()).toBe("foobaz");
    });

    test("can mock all methods", async () => {
        const client = new MockHttpClient();

        client.addExpected(
            new MockHttpResponse("/whatmethod", {
                status: 200,
                body: "Method was a GET!",
            }),
            {
                method: "GET",
            }
        );
        client.addExpected(
            new MockHttpResponse("/whatmethod", {
                status: 200,
                body: "Method was a POST!",
            }),
            {
                method: "POST",
            }
        );
        client.addExpected(
            new MockHttpResponse("/whatmethod", {
                status: 200,
                body: "Method was a PUT!",
            }),
            {
                method: "PUT",
            }
        );
        client.addExpected(
            new MockHttpResponse("/whatmethod", {
                status: 200,
                body: "Method was a DELETE!",
            }),
            {
                method: "DELETE",
            }
        );
        client.addExpected(
            new MockHttpResponse("/whatmethod", {
                status: 200,
                body: "Method was a PATCH!",
            }),
            {
                method: "PATCH",
            }
        );

        expect(await (await client.get("/whatmethod")).text()).toBe(
            "Method was a GET!"
        );
        expect(await (await client.post("/whatmethod")).text()).toBe(
            "Method was a POST!"
        );
        expect(await (await client.put("/whatmethod")).text()).toBe(
            "Method was a PUT!"
        );
        expect(await (await client.delete("/whatmethod")).text()).toBe(
            "Method was a DELETE!"
        );
        expect(await (await client.patch("/whatmethod")).text()).toBe(
            "Method was a PATCH!"
        );
    });

    test("remainingAssertions()", async () => {
        const client = new MockHttpClient();

        expect(client.remainingAssertions().length).toBe(0);

        client
            .addExpected(mockResponses.parker())
            .addExpected(mockResponses.nutmeg());
        expect(client.remainingAssertions().length).toBe(2);

        await client.get("/dogs/parker");
        expect(client.remainingAssertions()).toEqual(["/dogs/nutmeg"]);

        await client.get("/dogs/nutmeg");
        expect(client.remainingAssertions().length).toBe(0);
    });

    test("can differentiate request bodies", async () => {
        const client = new MockHttpClient();

        client.addExpected(
            new MockHttpResponse("/some/url", {
                status: 200,
                body: "response one",
            }),
            {
                method: "PUT",
                body: "one",
            }
        );

        client.addExpected(
            new MockHttpResponse("/some/url", {
                status: 200,
                body: "response two",
            }),
            {
                method: "PUT",
                body: "two",
            }
        );

        expect(
            await (await client.put("/some/url", { body: "one" })).text()
        ).toBe("response one");

        expect(
            await (await client.put("/some/url", { body: "two" })).text()
        ).toBe("response two");
    });

    test("supports sending string bodies", async () => {
        const client = new MockHttpClient();
        client.addExpected(
            new MockHttpResponse("/some/url", {
                status: 200,
            }),
            {
                method: "PUT",
                body: "this is a string",
            }
        );
        const response = await client.put("/some/url", {
            body: "this is a string",
        });
        expect(response.status).toBe(200);
    });

    test("supports sending URLSearchParams bodies", async () => {
        const client = new MockHttpClient();

        const body = new URLSearchParams({
            color: "red",
            shape: "triangle",
        });
        expect(client.serializeBody(body)).toBe("color=red&shape=triangle");

        client.addExpected(
            new MockHttpResponse("/some/url", {
                status: 200,
            }),
            {
                method: "PUT",
                body,
            }
        );
        const response = await client.put("/some/url", {
            body,
        });
        expect(response.status).toBe(200);
    });
});
