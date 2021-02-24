import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { NodeDeallocationOption } from "app/models/dtos";
import { Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

import "./deallocation-option-picker.scss";

@Component({
    selector: "bl-deallocation-option-picker",
    templateUrl: "deallocation-option-picker.html",
    providers: [
        /* eslint-disable @angular-eslint/no-forward-ref */
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DeallocationOptionPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => DeallocationOptionPickerComponent), multi: true },
    ],
})
export class DeallocationOptionPickerComponent implements OnDestroy, ControlValueAccessor {
    public form: FormGroup;
    public NodeDeallocationOption = NodeDeallocationOption;
    public nodeActionInfo: string;

    private _propagateChange: (value: any) => void;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            nodeDeallocationOption: NodeDeallocationOption.requeue,
        });

        this._sub = this.form.valueChanges.pipe(distinctUntilChanged()).subscribe((value: any) => {
            this._setCurrentOption(value.nodeDeallocationOption);
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: any) {
        value = value || {};
        this.form.patchValue(value);
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
        if (fn) {
            fn(this.form.value);
        }
    }

    public registerOnTouched(fn) {
        // Nothing to do
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (valid) {
            return null;
        }

        return {
            deallocationOption: this.form.errors,
        };
    }

    private _setCurrentOption(option: string) {
        switch (option) {
            case NodeDeallocationOption.requeue:
                this.nodeActionInfo = "Terminate running task processes and requeue the tasks. The tasks " +
                    "will run again when a node is available. Remove nodes as soon as tasks have been terminated.";
                break;
            case NodeDeallocationOption.terminate:
                this.nodeActionInfo = "Terminate running tasks. The tasks will be completed with failureInfo " +
                    "indicating that they were terminated, and will not run again. Remove nodes as soon as tasks " +
                    "have been terminated.";
                break;
            case NodeDeallocationOption.taskcompletion:
                this.nodeActionInfo = "Allow currently running tasks to complete. Schedule no new tasks while " +
                    "waiting. Remove nodes when all tasks have completed.";
                break;
            case NodeDeallocationOption.retaineddata:
                this.nodeActionInfo = "Allow currently running tasks to complete, then wait for all task data " +
                    "retention periods to expire. Schedule no new tasks while waiting. Remove nodes when all task " +
                    "retention periods have expired.";
                break;
            default:
                this.nodeActionInfo = "";
                break;

        }
    }
}
