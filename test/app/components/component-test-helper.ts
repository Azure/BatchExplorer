import { ComponentFixture } from "@angular/core/testing";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MdInput } from "@angular/material";

export class ComponentTestHelper<T> {
    constructor(private fixture: ComponentFixture<T>) {
    }

    /**
     * Assert that a FormGroup has an expected validation error
     */
    public expectValidation(
        formGroup: FormGroup,
        input: MdInput,
        name: string,
        value: any,
        validator: string,
        expected: boolean) {

        input.value = value;
        this.fixture.detectChanges();
        expect(formGroup.hasError(validator, [name])).toBe(expected);
    }
}
