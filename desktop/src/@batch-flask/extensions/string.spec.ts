import "./string";

describe("String extensions", () => {
    describe("string.format", () => {
        it("Should format string correctly with 1 argument", () => {
            expect("Some value is {0}".format("awesome")).toEqual("Some value is awesome");
        });

        it("Should format string correctly with multiple arguments", () => {
            expect("{0}:{1}".format("key", "val")).toEqual("key:val");
        });

        it("Should format string with key value", () => {
            expect("{foo}:{bar}".format({ foo: "key", other: "some", bar: "val" })).toEqual("key:val");
        });
    });

    describe("string.padStart", () => {
        it("Should pad the start of a string correctly", () => {
            expect("1".padStart(5, "0")).toEqual("00001");
            expect("1".padStart(5, "bob")).toEqual("bobb1");
            expect("10000".padStart(5, "0")).toEqual("10000");

            // should leave any over length strings as they are
            expect("50000000".padStart(5, "0")).toEqual("50000000");
        });

        it("Should pad string with spaces if no character supplied", () => {
            expect("1".padStart(5)).toEqual("    1");
        });
    });

    describe("string.trimEnd", () => {
        it("should trim the end off supplied string", () => {
            expect("something--".trimEnd("-")).toEqual("something");
        });

        it("handles trimming multiple", () => {
            expect("apple".trimEnd("l", "e")).toEqual("app");
        });

        it("should leave string unchanged if no value supplied", () => {
            expect("banana".trimEnd("")).toEqual("banana");
        });
    });
});
