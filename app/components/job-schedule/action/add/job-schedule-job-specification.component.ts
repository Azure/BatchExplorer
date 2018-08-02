import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    Validators,
} from "@angular/forms";
import { Subscription, of } from "rxjs";

import { RangeValidator } from "@batch-flask/ui/validation";
import { AllTasksCompleteAction, TaskFailureAction, VirtualMachineConfiguration } from "app/models";
import { PoolService } from "app/services";
import { Constants } from "app/utils";
import { debounceTime, distinctUntilChanged, flatMap } from "rxjs/operators";

@Component({
    selector: "bl-job-schedule-job-specification",
    templateUrl: "job-schedule-job-specification.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => JobScheduleJobSpecificationComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => JobScheduleJobSpecificationComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleJobSpecificationComponent implements ControlValueAccessor, OnDestroy {
    public AllTasksCompleteAction = AllTasksCompleteAction;
    public TaskFailureAction = TaskFailureAction;
    public form: FormGroup;
    public constraintsGroup: FormGroup;
    public virtualMachineConfiguration: VirtualMachineConfiguration = null;
    public containerSettingsRequired: boolean = true;
    public showJobReleaseTask: boolean;

    private _propagateChange: (value: any) => void = null;
    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private poolService: PoolService,
        private formBuilder: FormBuilder) {
        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
            maxWallClockTime: null,
            maxTaskRetryCount: [
                0,
                new RangeValidator(validation.range.retry.min, validation.range.retry.max).validator,
            ],
        });

        this.form = this.formBuilder.group({
            displayName: ["", Validators.maxLength(validation.maxLength.displayName)],
            priority: [
                0,
                new RangeValidator(validation.range.priority.min, validation.range.priority.max).validator,
            ],
            constraints: this.constraintsGroup,
            poolInfo: [null, Validators.required],
            jobManagerTask: null,
            jobPreparationTask: null,
            jobReleaseTask: null,
            onAllTasksComplete: [AllTasksCompleteAction.noaction],
            onTaskFailure: [TaskFailureAction.noaction],
        });

        this._subs.push(this.form.controls.jobPreparationTask.valueChanges.subscribe((value) => {
            this.showJobReleaseTask = value && value.id;
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.form.valueChanges.subscribe((value: any) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
            this.changeDetector.markForCheck();
        }));

        // Load current pool container configuration to indicate whether job manager, preparation and release task
        // displays task container setting accordingly
        this._subs.push(this.form.controls.poolInfo.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            flatMap(pool => pool ? this.poolService.get(pool.poolId) : of(null)),
        ).subscribe(pool => {
            this.virtualMachineConfiguration = pool && pool.virtualMachineConfiguration;
            if (!this.virtualMachineConfiguration || !this.virtualMachineConfiguration.containerConfiguration) {
                // Reset job manager, preperation and release task container settings because pool id is changed
                // because user might change a container-pool to a non-container pool or vice versa
                const jobManagerTask = this.form.controls.jobManagerTask.value;
                const jobPreparationTask = this.form.controls.jobPreparationTask.value;
                const jobReleaseTask = this.form.controls.jobReleaseTask.value;
                if (jobManagerTask) {
                    jobManagerTask.containerSettings = null;
                    this.form.controls.jobManagerTask.patchValue(jobManagerTask);
                }
                if (jobPreparationTask) {
                    jobPreparationTask.containerSettings = null;
                }
                if (jobReleaseTask) {
                    jobReleaseTask.containerSettings = null;
                }
                this.containerSettingsRequired = false;
            } else {
                this.containerSettingsRequired = true;
            }
            this.changeDetector.markForCheck();
        }));
    }

    public writeValue(value: any) {
        if (value) {
            this.form.patchValue(value);
        } else {
            this.form.reset();
        }
    }

    public ngOnDestroy() {
        this._subs.forEach(sub => sub.unsubscribe());
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (!valid) {
            return {
                jobSpecification: {
                    valid: false,
                },
            };
        }
        return null;
    }

    public preSelectPool(poolId: string) {
        this.form.patchValue({ poolInfo: { poolId } });
    }

    public get jobManagerTask() {
        return this.form.controls.jobManagerTask.value;
    }

    public get jobPreparationTask() {
        return this.form.controls.jobPreparationTask.value;
    }

    public get jobReleaseTask() {
        return this.form.controls.jobReleaseTask.value;
    }

    public resetJobPreparationTask() {
        this.showJobReleaseTask = false;
        const jobReleaseTask = this.form.controls.jobReleaseTask;
        jobReleaseTask.setValue(null);
    }
}
