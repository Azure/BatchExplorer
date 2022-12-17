import { isHttpHeaders } from "../http-util";
import { MapHttpHeaders } from "../map-http-headers";

describe("HTTP utilities", () => {
    test("isHttpHeaders() type guard", () => {
        expect(
            isHttpHeaders({
                append: () => "foo",
            })
        ).toBeFalsy();

        expect(isHttpHeaders(new MapHttpHeaders())).toBeTruthy();
    });
});
