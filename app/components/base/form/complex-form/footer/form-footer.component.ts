import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { FormPageComponent } from "app/components/base/form/form-page";
import { ComplexFormComponent, ComplexFormConfig } from "../complex-form.component";

import { AsyncTask } from "app/core";
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
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFooterComponent {
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
    @Input() public formGroup: FormGroup;
    @Input() public isMainWindow: boolean;
    @Output() public showJsonEditorChanges = new EventEmitter<boolean>();

    private _actionConfig: FormActionConfig;

    constructor(public form: ComplexFormComponent) { }

    public toggleJsonEditor(show) {
        this.showJsonEditorChanges.emit(show);
        this.showJsonEditor = show;
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
        } else {
            return !this.formGroup || this.formGroup.valid;
        }
    }

    public get saveAndCloseText() {
        return this.actionConfig.multiUse ? `${this.actionConfig.name} and close` : this.actionConfig.name;
    }
}
