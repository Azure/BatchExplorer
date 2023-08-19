import { initMockEnvironment } from "../../environment";
import { getHttpClient, isHttpHeaders } from "../http-util";
import { MapHttpHeaders } from "../map-http-headers";
import { MockHttpClient } from "../mock-http-client";

describe("HTTP utilities", () => {
    beforeEach(() => initMockEnvironment());

    test("isHttpHeaders() type guard", () => {
        expect(
            isHttpHeaders({
                append: () => "foo",
            })
        ).toBeFalsy();

        expect(isHttpHeaders(new MapHttpHeaders())).toBe(true);
    });

    test("getHttpClient()", () => {
        const client = getHttpClient();
        expect(client).toBeDefined();
        expect(client instanceof MockHttpClient).toBe(true);
    });
});
