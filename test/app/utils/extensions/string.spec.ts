import "app/utils/extensions/string";

describe("String extensions", () => {
    it("Should format string correctly with 1 argument", () => {
        expect("Some value is {0}".format("awesome")).toEqual("Some value is awesome");
    });

    it("Should format string correctly with multiple arguments", () => {
        expect("{0}:{1}".format("key", "val")).toEqual("key:val");
    });

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
