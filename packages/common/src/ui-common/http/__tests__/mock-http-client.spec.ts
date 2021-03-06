import { MockHttpClient, MockHttpResponse } from "../mock-http-client";

test("Can Mock a single GET request", async () => {
    const client = new MockHttpClient();

    client.addExpected(
        new MockHttpResponse(
            "/dogs/parker",
            200,
            `{"name": "Parker", "breed": "Schnauzer"}`
        )
    );

    const response = await client.get("/dogs/parker");
    expect(await response.text()).toBe(
        `{"name": "Parker", "breed": "Schnauzer"}`
    );
    expect(await response.json()).toStrictEqual({
        name: "Parker",
        breed: "Schnauzer",
    });
});
