import { DebugElement } from "@angular/core";
import { ComponentFixture } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";

export class ComponentTestHelper<T> {
    constructor(private fixture: ComponentFixture<T>) {
    }

    /**
     * Assert that a FormGroup has an expected validation error
     */
    public expectValidation(
        formGroup: FormGroup,
        input: DebugElement,
        name: string,
        value: any,
        validator: string,
        expected: boolean) {

        input.nativeElement.value = value;
        input.nativeElement.dispatchEvent(new Event("input"));
        this.fixture.detectChanges();
        const msg = `Expected validation "${validator}" to be ${expected}`;
        expect(formGroup.hasError(validator, [name])).toBe(expected, msg);
    }
}
