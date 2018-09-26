import { Component, forwardRef } from "@angular/core";
import {
    FormBuilder,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { JobTaskBaseComponent } from "./job-task-base.component";

const DEFAULT_JOBMANAGER = {
    id: "",
    displayName: null,
    commandLine: "",
    killJobOnCompletion: true,
    runExclusive: true,
};
const INVALID_RESPONSE = {
    jobManagerTaskPicker: {
        valid: false,
        missingSelection: true,
    },
};

@Component({
    selector: "bl-job-manager-task-picker",
    templateUrl: "job-manager-task-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobManagerTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => JobManagerTaskPickerComponent), multi: true },
    ],
})
export class JobManagerTaskPickerComponent extends JobTaskBaseComponent {
    constructor(formBuilder: FormBuilder) {
        super(formBuilder, DEFAULT_JOBMANAGER, INVALID_RESPONSE);
        this._baseFormControls["displayName"] = [null];
        this._baseFormControls["killJobOnCompletion"] = [true];
        this._baseFormControls["runExclusive"] = [true];
        this.form = formBuilder.group(this._baseFormControls);
        this.form.valueChanges.subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(val);
            }
        });
    }
}
