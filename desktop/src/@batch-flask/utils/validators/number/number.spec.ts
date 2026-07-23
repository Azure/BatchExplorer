import { UntypedFormControl } from "@angular/forms";
import { max, min, number } from "./number";

describe("Number Validator", () => {
    describe("min validator", () => {
        it("return null when valid", () => {
            expect(min(10)(new UntypedFormControl(10))).toBe(null);
            expect(min(10)(new UntypedFormControl(15))).toBe(null);
            expect(min(10)(new UntypedFormControl(100))).toBe(null);
        });

        it("return error when invvalid", () => {
            expect(min(10)(new UntypedFormControl(9))).toEqual({ min: true });
            expect(min(10)(new UntypedFormControl(1))).toEqual({ min: true });
            expect(min(10)(new UntypedFormControl(-11))).toEqual({ min: true });
        });
    });

    describe("max validator", () => {
        it("return null when valid", () => {
            expect(max(10)(new UntypedFormControl(10))).toBe(null);
            expect(max(10)(new UntypedFormControl(9))).toBe(null);
            expect(max(10)(new UntypedFormControl(-100))).toBe(null);
        });

        it("return error when invvalid", () => {
            expect(max(10)(new UntypedFormControl(11))).toEqual({ max: true });
            expect(max(10)(new UntypedFormControl(15))).toEqual({ max: true });
            expect(max(10)(new UntypedFormControl(100))).toEqual({ max: true });
        });
    });

    describe("number validator", () => {
        it("return null when valid", () => {
            // Empty string is not considered and error as it could not be required
            expect(number(new UntypedFormControl(""))).toBe(null);
            expect(number(new UntypedFormControl("0"))).toBe(null);
            expect(number(new UntypedFormControl("9"))).toBe(null);
            expect(number(new UntypedFormControl("-100"))).toBe(null);
            expect(number(new UntypedFormControl("1.43"))).toBe(null);
        });

        it("return error when invvalid", () => {
            expect(number(new UntypedFormControl("abcdef"))).toEqual({ number: true });
            expect(number(new UntypedFormControl("1f23"))).toEqual({ number: true });
        });
    });
});
