import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChild, ContentChildren, QueryList,
} from "@angular/core";

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

    @ContentChild(FormFieldControl) public control: FormFieldControl<any>;

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    public ngAfterContentInit() {
        if (!this.control) {
            throw new Error("bl-form-field is expecting an control under. This can either be a blInput.");
        }
        this.prefix.changes.subscribe(() => this.changeDetector.markForCheck());
        this.suffix.changes.subscribe(() => this.changeDetector.markForCheck());
    }
}
