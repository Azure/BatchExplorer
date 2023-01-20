import { RawHttpHeaders } from "@azure/core-rest-pipeline";
import { PipelineHttpHeadersImpl } from "../http/PipelineHttpHeaders";
import { MapHttpHeaders } from "@batch/ui-common/lib/http";

describe("PipelineHttpHeadersImpl", () => {
    test("Pipeline Initialization with MapHttpHeaders", () => {
        const headers = new PipelineHttpHeadersImpl(
            new MapHttpHeaders({
                foo: "bar",
                "x-foo": "x-bar",
            })
        );
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar");
        expect(headers.has("foo")).toBe(true);
    });

    test("Can append/delete/set headers", () => {
        const headers = new PipelineHttpHeadersImpl(
            new MapHttpHeaders({
                foo: "bar",
                "x-foo": "x-bar",
            })
        );
        expect(countHeaders(headers)).toBe(2);

        headers.delete("foo");
        expect(countHeaders(headers)).toBe(1);
        expect(headers.get("foo")).toBeUndefined();
        expect(headers.has("foo")).toBe(false);

        headers.append("foo", "bar");
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar");

        headers.append("foo", "baz");
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar, baz");

        headers.delete("foo");
        expect(headers.get("foo")).toBeUndefined();

        headers.set("foo", "baz");
        headers.set("foo", true);
        expect(headers.get("foo")).toBe("true");
        expect(countHeaders(headers)).toBe(2);

        headers.set("foo", 5);
        expect(headers.get("foo")).toBe("5");
        expect(countHeaders(headers)).toBe(2);
    });

    test("Can iterate through a PipelineHttpHeaders instance", () => {
        const headers = new PipelineHttpHeadersImpl(
            new MapHttpHeaders({
                foo: "bar",
                "x-foo": "x-bar",
            })
        );
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar");

        headers.append("foo", "baz");
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar, baz");

        for (const [name, value] of headers) {
            expect(value).toBe(headers.get(name));
        }
    });

    test("Can return JSON representation of http header collection", () => {
        const headers = new PipelineHttpHeadersImpl(
            new MapHttpHeaders({
                foo: "bar",
                "x-foo": "x-bar",
            })
        );
        const httpHeaderJson: RawHttpHeaders = headers.toJSON();
        for (const [name, value] of headers) {
            expect(httpHeaderJson[name]).toBe(value);
        }
    });
});

function countHeaders(headers: PipelineHttpHeadersImpl): number {
    let i = 0;
    for (const [name, value] of headers) {
        ++i;
    }
    return i;
}
