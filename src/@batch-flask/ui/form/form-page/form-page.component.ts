import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Inject, Input,
    OnChanges,
    OnDestroy,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    forwardRef,
} from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { ComplexFormComponent } from "../complex-form";
import { FormSectionComponent } from "../form-section";

import { startWith } from "rxjs/operators";
import "./form-page.scss";

export interface FocusableElement {
    focus();
}

@Component({
    selector: "bl-form-page",
    templateUrl: "form-page.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPageComponent implements OnChanges, AfterContentInit, OnDestroy {

    /**
     * Enabled if the formGroup is valid or there is no formGroup
     */
    public get submitEnabled() {
        return !this.formGroup || this.formGroup.valid;
    }
    /**
     * Title of the page. It will be shown when this page is the current page of a form.
     */
    @Input() public title: string;

    /**
     * Subtitle of the page. It will be shown when this page is the current page of a form.
     */
    @Input() public subtitle: string;

    @Input() public formGroup: AbstractControl;

    /**
     * Event that will trigger when user click cancel or back.
     */
    @Output() public cancel = new EventEmitter();

    /**
     * Event that will trigger when user click select or submit.
     */
    @Output() public submit = new EventEmitter();

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @ContentChildren(FormSectionComponent)
    public sections: QueryList<FormSectionComponent>;

    /**
     * Reference to the picker that opened the page if applicable
     */
    public openedWith: FocusableElement;

    public valid: Observable<boolean>;
    public _statusSub: Subscription;
    private _valid = new BehaviorSubject(false);

    constructor(
        @Inject(forwardRef(() => ComplexFormComponent)) private form: ComplexFormComponent,
        private changeDetector: ChangeDetectorRef) {
        this.valid = this._valid.asObservable();
    }

    public ngAfterContentInit() {
        this.sections.changes.subscribe(() => {
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.formGroup) {
            this._clearStatusSub();
            if (this.formGroup) {
                this._statusSub = this.formGroup.statusChanges.pipe(startWith(null)).subscribe(() => {
                    this._valid.next(this.formGroup.valid);
                });
            } else {
                this._valid.next(true);
            }
        }
    }

    public ngOnDestroy() {
        this._clearStatusSub();
    }
    /**
     * Open the given page. It will push on top of the page stack.
     * @param picker If opening from a picker
     */
    public activate(picker?: FocusableElement) {
        this.openedWith = picker;
        this.form.openPage(this);
    }

    public trackByFn(_, section: FormSectionComponent) {
        return section.title;
    }

    private _clearStatusSub() {
        if (this._statusSub) {
            this._statusSub.unsubscribe();
        }
    }
}
