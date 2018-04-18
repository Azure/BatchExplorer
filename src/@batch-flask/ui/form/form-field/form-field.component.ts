import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChild, ContentChildren, HostBinding, QueryList,
} from "@angular/core";

import { FormErrorComponent } from "@batch-flask/ui/form/form-error";
import { HintComponent } from "@batch-flask/ui/form/hint";
import { FormFieldControl } from "./form-field-control";
import { FormFieldPrefixDirective, FormFieldSuffixDirective } from "./form-field.directive";

import "./form-field.scss";

@Component({
    selector: "bl-form-field",
    templateUrl: "form-field.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements AfterContentInit {
    @ContentChildren(FormFieldPrefixDirective) public prefix: QueryList<FormFieldPrefixDirective>;
    @ContentChildren(FormFieldSuffixDirective) public suffix: QueryList<FormFieldSuffixDirective>;
    @ContentChildren(HintComponent) public hints: QueryList<HintComponent>;
    @ContentChildren(FormErrorComponent) public errors: QueryList<FormErrorComponent>;

    @ContentChild(FormFieldControl) public control: FormFieldControl<any>;

    @HostBinding("class.bl-disabled")
    public get disabled() {
        return this.control.disabled;
    }

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    public ngAfterContentInit() {
        if (!this.control) {
            throw new Error("bl-form-field is expecting an control under. This can either be a blInput, bl-select.");
        }
        this.prefix.changes.subscribe(() => this.changeDetector.markForCheck());
        this.suffix.changes.subscribe(() => this.changeDetector.markForCheck());
        this.hints.changes.subscribe(() => this.changeDetector.markForCheck());
        this.errors.changes.subscribe(() => this.changeDetector.markForCheck());
    }
}
