import { ChangeDetectionStrategy, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";

import { JobService } from "app/services";

import "./job-id.scss";

@Component({
    selector: "bl-job-id",
    templateUrl: "job-id.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobIdComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => JobIdComponent), multi: true },
    ],
})
export class JobIdComponent implements ControlValueAccessor, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    public value = new FormControl();
    public warning = false;

    private _propagateChange: (value: any) => void = null;
    private _subscriptions: Subscription[] = [];

    constructor(private jobService: JobService) {
        this._subscriptions.push(this.value.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            this._checkValid(value);
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
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
        return null;
    }

    private _checkValid(value: string) {
        this.jobService.get(value).subscribe({
            next: (job: any) => {
                this.warning = true;
                this.value.setErrors({
                    notUnique: true,
                });
            },
            error: () => {
                this.warning = false;
                this.value.setErrors({});
            },
        });
    }
}
