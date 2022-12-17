import { MapHttpHeaders } from "../map-http-headers";

describe("MapHttpHeaders", () => {
    test("Default constructor", () => {
        const headers = new MapHttpHeaders();
        expect(countHeaders(headers)).toBe(0);
        expect(headers.get("doesntexist")).toBeNull();
        expect(headers.has("doesntexist")).toBe(false);

        // Shouldn't throw
        headers.delete("doesntexist");
    });

    test("Record initialization", () => {
        const headers = new MapHttpHeaders({
            foo: "bar",
            "x-foo": "x-bar",
        });
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar");
        expect(headers.has("foo")).toBe(true);
    });

    test("Headers initialization", () => {
        const headers = new MapHttpHeaders(
            new MapHttpHeaders({
                foo: "bar",
                "x-foo": "x-bar",
            })
        );
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar");
        expect(headers.has("foo")).toBe(true);
    });

    test("Can append/delete/set", () => {
        const headers = new MapHttpHeaders({
            foo: "bar",
            "x-foo": "x-bar",
        });
        expect(countHeaders(headers)).toBe(2);

        headers.delete("foo");
        expect(countHeaders(headers)).toBe(1);
        expect(headers.get("foo")).toBeNull();
        expect(headers.has("foo")).toBe(false);

        headers.append("foo", "bar");
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar");

        headers.append("foo", "baz");
        expect(countHeaders(headers)).toBe(2);
        expect(headers.get("foo")).toBe("bar, baz");

        headers.delete("foo");
        expect(headers.get("foo")).toBeNull();

        headers.set("foo", "bar");
        headers.set("foo", "baz");
        expect(headers.get("foo")).toBe("baz");
    });
});

function countHeaders(headers: MapHttpHeaders): number {
    let i = 0;
    headers.forEach(() => i++);
    return i;
}
