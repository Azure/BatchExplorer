import { prettyBytes } from "./misc";

describe("MiscUtils", () => {
    describe("prettyBytes()", () => {

        it("Prints bytes", () => {
            expect(prettyBytes(0)).toEqual("0 B");
            expect(prettyBytes(123)).toEqual("123 B");
            expect(prettyBytes(153, 0)).toEqual("153 B");
            expect(prettyBytes(37, 1)).toEqual("37 B");
        });

        it("Prints GB", () => {
            expect(prettyBytes(16_384_000_000)).toEqual("16.38 GB");
            expect(prettyBytes(16_384_000_000, 0)).toEqual("16 GB");
            expect(prettyBytes(124_839_494_000)).toEqual("124.84 GB");
        });
    });
});
