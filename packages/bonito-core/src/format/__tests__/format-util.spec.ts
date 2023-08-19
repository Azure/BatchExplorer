import { toIsoLocal } from "../../datetime";
import { autoFormat } from "../format-util";

describe("Format utilities", () => {
    test("autoFormat() function", () => {
        expect(autoFormat(null)).toBe("");
        expect(autoFormat(undefined)).toBe("");

        expect(autoFormat("foo")).toBe("foo");

        expect(autoFormat(123)).toBe("123");
        expect(autoFormat(123.456)).toBe("123.456");

        const now = new Date();
        const nowLocal = toIsoLocal(now);
        expect(autoFormat(now)).toBe(nowLocal);

        expect(
            autoFormat(["foo", 1, null, undefined, ["bar"], { foo: "baz" }])
        ).toBe(`foo, 1, , , bar, {"foo":"baz"}`);

        expect(autoFormat({ foo: { bar: "baz" } })).toBe(
            `{"foo":{"bar":"baz"}}`
        );
    });
});
