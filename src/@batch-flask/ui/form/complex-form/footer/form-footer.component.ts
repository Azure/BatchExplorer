import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { AsyncTask, ServerError } from "@batch-flask/core";
import { FormPageComponent } from "@batch-flask/ui/form/form-page";
import { Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { ComplexFormComponent, ComplexFormConfig } from "../complex-form.component";

import "./form-footer.scss";

export interface FormActionConfig {
    /**
     * Action name
     * @default: save
     */
    name?: string;

    /**
     * Action color
     * @default primary
     */
    color?: string;

    /**
     * Cancel text
     * @default Close
     */
    cancel?: string;

    /**
     * If the form should allow to save without closing
     * @default true
     */
    multiUse?: boolean;
}

const defaultActionConfig: FormActionConfig = {
    name: "Save",
    color: "primary",
    cancel: "Close",
};

@Component({
    selector: "bl-form-footer",
    templateUrl: "form-footer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFooterComponent implements OnChanges, OnDestroy {
    @Input() public waitingForAsyncTask: boolean;
    @Input() public asyncTasks: AsyncTask[];
    @Input() public config: ComplexFormConfig;
    @Input() public set actionConfig(actionConfig: FormActionConfig) {
        this._actionConfig = { ...defaultActionConfig, ...actionConfig };
    }
    public get actionConfig() { return this._actionConfig; }
    @Input() public jsonValue: FormControl;
    @Input() public showJsonEditor: boolean;
    @Input() public currentPage: FormPageComponent;
    @Input() public error: ServerError;
    @Input() public showError: boolean;
    @Output() public showErrorChange = new EventEmitter<boolean>();
    @Output() public showJsonEditorChanges = new EventEmitter<boolean>();

    public isMainWindow: boolean;
    private _actionConfig: FormActionConfig;
    private _statusSub: Subscription;

    constructor(public form: ComplexFormComponent, private changeDetector: ChangeDetectorRef) { }

    public ngOnChanges(changes) {
        if (changes.currentPage) {
            this.isMainWindow = this.currentPage === this.form.mainPage;
            if (this._statusSub) {
                this._statusSub.unsubscribe();
            }
            if (this.currentPage && this.currentPage.formGroup) {
                this._statusSub = this.currentPage.formGroup.statusChanges.pipe(distinctUntilChanged())
                    .subscribe((status) => {
                        this.changeDetector.markForCheck();
                    });
            }
        }
    }

    public ngOnDestroy() {
        if (this._statusSub) {
            this._statusSub.unsubscribe();
        }
    }

    public toggleJsonEditor(show) {
        this.showJsonEditorChanges.emit(show);
        this.showJsonEditor = show;
        this.changeDetector.markForCheck();
    }

    public toggleShowError() {
        this.showError = !this.showError;
        this.showErrorChange.emit(this.showError);
    }

    /**
     * There are two cases that classic form selector in footer should be disabled
     * 1. showJsonEditor variable is false which means current form is already classic form
     * 2. Current json edit JSON value is in a wrong format
     */
    public get classicFormDisabled() {
        return !this.showJsonEditor || !this.jsonValue.valid;
    }

    /**
     * Enabled if the formGroup is valid or there is no formGroup
     */
    public get submitEnabled() {
        if (this.showJsonEditor) {
            return this.jsonValue.valid;
        } else if (this.currentPage) {
            return !this.currentPage.formGroup || this.currentPage.formGroup.valid;
        } else {
            return false;
        }
    }

    public get saveAndCloseText() {
        return this.actionConfig.multiUse ? `${this.actionConfig.name} and close` : this.actionConfig.name;
    }

    public get asyncTaskTooltip() {
        if (!this.asyncTasks) { return null; }
        return this.asyncTasks.slice(1).map(x => x.name).join("\n");
    }
}
