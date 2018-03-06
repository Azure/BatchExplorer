import { FormControl } from "@angular/forms";
import { max, min, number } from "./number";

describe("Number Validator", () => {
    describe("min validator", () => {
        it("return null when valid", () => {
            expect(min(10)(new FormControl(10))).toBe(null);
            expect(min(10)(new FormControl(15))).toBe(null);
            expect(min(10)(new FormControl(100))).toBe(null);
        });

        it("return error when invvalid", () => {
            expect(min(10)(new FormControl(9))).toEqual({ min: true });
            expect(min(10)(new FormControl(1))).toEqual({ min: true });
            expect(min(10)(new FormControl(-11))).toEqual({ min: true });
        });
    });

    describe("max validator", () => {
        it("return null when valid", () => {
            expect(max(10)(new FormControl(10))).toBe(null);
            expect(max(10)(new FormControl(9))).toBe(null);
            expect(max(10)(new FormControl(-100))).toBe(null);
        });

        it("return error when invvalid", () => {
            expect(max(10)(new FormControl(11))).toEqual({ max: true });
            expect(max(10)(new FormControl(15))).toEqual({ max: true });
            expect(max(10)(new FormControl(100))).toEqual({ max: true });
        });
    });

    describe("number validator", () => {
        it("return null when valid", () => {
            // Empty string is not considered and error as it could not be required
            expect(number(new FormControl(""))).toBe(null);
            expect(number(new FormControl("0"))).toBe(null);
            expect(number(new FormControl("9"))).toBe(null);
            expect(number(new FormControl("-100"))).toBe(null);
            expect(number(new FormControl("1.43"))).toBe(null);
        });

        it("return error when invvalid", () => {
            expect(number(new FormControl("abcdef"))).toEqual({ number: true });
            expect(number(new FormControl("1f23"))).toEqual({ number: true });
        });
    });
});
