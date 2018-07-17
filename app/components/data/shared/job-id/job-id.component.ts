import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    AsyncValidator,
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_ASYNC_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Observable, Subscription, timer } from "rxjs";

import { Job } from "app/models";
import { JobService } from "app/services";

import { autobind } from "@batch-flask/core";
import { FormUtils } from "@batch-flask/utils";
import "./job-id.scss";

@Component({
    selector: "bl-job-id",
    templateUrl: "job-id.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobIdComponent), multi: true },
        { provide: NG_ASYNC_VALIDATORS, useExisting: forwardRef(() => JobIdComponent), multi: true },
    ],
})
export class JobIdComponent implements AsyncValidator, ControlValueAccessor, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    public value: FormControl<string>;
    public warning = false;

    private _propagateChange: (value: any) => void = null;
    private _subscription: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private jobService: JobService) {

        this.value = this.formBuilder.control([], null, this._validateJobUnique);
        this._subscription = this.value.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    public writeValue(value: string) {
        this.value.setValue(value);
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return FormUtils.passValidation(this.value);
    }

    @autobind()
    private _validateJobUnique(control: FormControl) {
        // on init, value is an empty array.
        if (!control.value || (Array.isArray(control.value) && control.value.length === 0)) {
            return Observable.of(null);
        }

        return timer(250)
            .flatMap(() => this.jobService.get(control.value))
            .map((job: Job) => {
                this.warning = true;
                this.changeDetector.markForCheck();
                return Observable.of({
                    duplicateJob: {
                        valid: false,
                    },
                });
            }).catch(() => {
                this.warning = false;
                this.changeDetector.markForCheck();
                return Observable.of(null);
            });
    }
}
