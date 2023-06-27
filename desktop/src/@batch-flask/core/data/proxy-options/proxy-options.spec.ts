import { ProxyOptions } from "@batch-flask/core";

describe("ProxyOptions", () => {
    it("should create from attributes", () => {
        const options = new ProxyOptions({ select: "id,state", foo: "bar" });
        expect(options.select).toEqual("id,state");
        expect(options.attributes).toEqual({ foo: "bar" });
        expect(options.original).toEqual({ select: "id,state", foo: "bar" });
    });

    it("should create from other options", () => {
        const other = new ProxyOptions({ select: "id,state", foo: "bar" });
        const options = new ProxyOptions(other);
        expect(options.select).toEqual("id,state");
        expect(options.attributes).toEqual({ foo: "bar" });
        expect(options.original instanceof ProxyOptions).toBe(false);
        expect(options.original).toEqual({ select: "id,state", foo: "bar" });
    });
});
