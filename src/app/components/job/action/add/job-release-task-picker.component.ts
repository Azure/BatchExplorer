import { Component, forwardRef } from "@angular/core";
import {
    FormBuilder,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    Validators,
} from "@angular/forms";
import { Duration } from "luxon";
import { JobTaskBaseComponent } from "./job-task-base.component";

const DEFAULT_JOBRELEASE_ID = "jobrelease";
const DEFAULT_JOBRELEASE = {
    id: DEFAULT_JOBRELEASE_ID,
    commandLine: "",
};
const INVALID_RESPONSE = {
    jobReleaseTaskPicker: {
        valid: false,
        missingSelection: true,
    },
    constraints: {
        retentionTime: Duration.fromObject({days: 7}),
    },
};

@Component({
    selector: "bl-job-release-task-picker",
    templateUrl: "job-release-task-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobReleaseTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => JobReleaseTaskPickerComponent), multi: true },
    ],
})
export class JobReleaseTaskPickerComponent extends JobTaskBaseComponent {
    constructor(formBuilder: FormBuilder) {
        super(formBuilder, DEFAULT_JOBRELEASE, INVALID_RESPONSE);
        this._baseFormControls["id"] = [DEFAULT_JOBRELEASE_ID, Validators.required];
        this.form = formBuilder.group(this._baseFormControls);
        this.form.valueChanges.subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(val);
            }
        });
    }
}
