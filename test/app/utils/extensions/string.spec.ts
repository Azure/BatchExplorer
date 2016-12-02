import "app/utils/extensions/string";

describe("String extensions", () => {
    it("Should format string correctly with 1 argument", () => {
        expect("Some value is {0}".format("awesome")).toEqual("Some value is awesome");
    });

    it("Should format string correctly with multiple arguments", () => {
        expect("{0}:{1}".format("key", "val")).toEqual("key:val");
    });
});
