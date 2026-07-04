import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { FormUtils } from "./form-utils";

describe("FormUtils", () => {

    describe("#getControl", () => {
        let control1: UntypedFormControl;
        let control2: UntypedFormControl;

        beforeEach(() => {
            control1 = new UntypedFormControl();
            control2 = new UntypedFormControl();

            control1.setValue("Control 1");
            control2.setValue("Control 2");
        });

        it("should get a simple control", () => {
            const group = new UntypedFormGroup({
                control1,
                control2,
            });

            expect(FormUtils.getControl(group, "control1")).toBe(control1);
            expect(FormUtils.getControl(group, "control2")).toBe(control2);
        });

        it("should get a nested control", () => {
            const group = new UntypedFormGroup({
                group1: new UntypedFormGroup({
                    control1,
                }),
                group2: new UntypedFormGroup({
                    control2,
                }),
            });

            expect(FormUtils.getControl(group, "group1.control1")).toBe(control1);
            expect(FormUtils.getControl(group, "group2.control2")).toBe(control2);
        });

        it("should throws an error when not found", () => {
            const group = new UntypedFormGroup({
                group1: new UntypedFormGroup({
                    control1,
                }),
                control2,
            });

            expect(() => FormUtils.getControl(group, "invalidControl")).toThrowError();
            expect(() => FormUtils.getControl(group, "invalid.control")).toThrowError();
            expect(() => FormUtils.getControl(group, "group1.invalid")).toThrowError();
        });
    });
});
