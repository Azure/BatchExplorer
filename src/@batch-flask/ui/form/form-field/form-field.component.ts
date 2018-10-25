import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    HostBinding,
    HostListener,
    QueryList,
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
        this.hints.changes.subscribe(() => {
            this._syncDescribedByIds();
            this.changeDetector.markForCheck();
        });
        this.errors.changes.subscribe(() => {
            this._syncDescribedByIds();
            this.changeDetector.markForCheck();
        });
        this._syncDescribedByIds();
    }

    @HostListener("click", ["$event"])
    public notifyControlToFocus(event: MouseEvent) {
        if (this.control.disabled) { return; }
        this.control.onContainerClick(event);
    }

    /**
     * Sets the list of element IDs that describe the child control. This allows the control to update
     * its `aria-describedby` attribute accordingly.
     */
    private _syncDescribedByIds() {
        if (!this.control) { return; }
        let ids: string[] = [];
        if (this.errors && this.errors.length > 0) {
            ids = ids.concat(this.errors.map(error => error.id));
        }
        ids = ids.concat(this.hints.map(hint => hint.id));
        this.control.setDescribedByIds(ids);
    }
}
