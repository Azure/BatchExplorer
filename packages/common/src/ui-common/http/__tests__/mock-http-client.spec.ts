import { MockHttpClient, MockHttpResponse } from "../mock-http-client";

const mockResponses = {
    parker: new MockHttpResponse(
        "/dogs/parker",
        200,
        `{"name": "Parker", "breed": "Schnauzer"}`
    ),
    nutmeg: new MockHttpResponse(
        "/dogs/nutmeg",
        200,
        `{"name": "Nutmeg", "breed": "Shihpoo"}`
    ),
};

describe("MockHttpClient", () => {
    test("can Mock a single GET request", async () => {
        const client = new MockHttpClient();

        client.addExpected(mockResponses.parker);

        const response = await client.get("/dogs/parker");
        expect(await response.text()).toBe(
            `{"name": "Parker", "breed": "Schnauzer"}`
        );
        expect(await response.json()).toStrictEqual({
            name: "Parker",
            breed: "Schnauzer",
        });
    });

    test("remainingAssertions()", async () => {
        const client = new MockHttpClient();

        expect(client.remainingAssertions().length).toBe(0);

        client
            .addExpected(mockResponses.parker)
            .addExpected(mockResponses.nutmeg);
        expect(client.remainingAssertions().length).toBe(2);

        await client.get("/dogs/parker");
        expect(client.remainingAssertions()).toEqual(["/dogs/nutmeg"]);

        await client.get("/dogs/nutmeg");
        expect(client.remainingAssertions().length).toBe(0);
    });
});
