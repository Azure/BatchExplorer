import { isHttpHeaders } from "../http-util";
import { MockHttpHeaders } from "../mock-http-client";

describe("HTTP utilities", () => {
    test("isHttpHeaders() type guard", () => {
        expect(
            isHttpHeaders({
                append: () => "foo",
            })
        ).toBeFalsy();

        expect(isHttpHeaders(new MockHttpHeaders())).toBeTruthy();
    });
});
