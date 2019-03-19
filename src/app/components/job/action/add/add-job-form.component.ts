import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicForm, autobind } from "@batch-flask/core";
import { ComplexFormConfig } from "@batch-flask/ui/form";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { RangeValidator } from "@batch-flask/ui/validation";
import { AllTasksCompleteAction, Job, TaskFailureAction, UserAccount, VirtualMachineConfiguration } from "app/models";
import { JobCreateDto } from "app/models/dtos";
import { createJobFormToJsonData, jobToFormModel } from "app/models/forms";
import { JobService, PoolService } from "app/services";
import { Constants } from "common";
import { List } from "immutable";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";

import "./add-job-form.scss";

@Component({
    selector: "bl-add-job-form",
    templateUrl: "add-job-form.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddJobFormComponent extends DynamicForm<Job, JobCreateDto> {
    public userAccounts: List<UserAccount>;
    public AllTasksCompleteAction = AllTasksCompleteAction;
    public TaskFailureAction = TaskFailureAction;

    public complexFormConfig: ComplexFormConfig = {
        jsonEditor: {
            dtoType: JobCreateDto,
            toDto: (value) => this.formToDto(value),
            fromDto: (value) => this.dtoToForm(value),
        },
    };

    public constraintsGroup: FormGroup;
    public showJobReleaseTask: boolean;
    public title = "Create job";
    public subtitle = null;
    public fileUri = "create.job.batch.json";
    public virtualMachineConfiguration: VirtualMachineConfiguration = null;

    constructor(
        public sidebarRef: SidebarRef<AddJobFormComponent>,
        protected formBuilder: FormBuilder,
        protected jobService: JobService,
        protected changeDetector: ChangeDetectorRef,
        protected notificationService: NotificationService,
        poolService: PoolService,
    ) {
        super(JobCreateDto);

        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
            maxWallClockTime: null,
            maxTaskRetryCount: [
                0,
                new RangeValidator(validation.range.retry.min, validation.range.retry.max).validator,
            ],
        });

        this.form = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.id),
                Validators.pattern(validation.regex.id),
            ]],
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
            metadata: [null],
            commonEnvironmentSettings: [null],
            usesTaskDependencies: [false],
        });

        this.form.controls.jobPreparationTask.valueChanges.subscribe((value) => {
            this.showJobReleaseTask = value && value.id;
            this.changeDetector.markForCheck();
        });

        // Load current pool container configuration to indicate whether job manager, preparation and release task
        // displays task container setting accordingly
        this.form.controls.poolInfo.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(pool => pool ? poolService.get(pool.poolId) : of(null)),
        ).subscribe((pool) => {
            this.virtualMachineConfiguration = pool && pool.virtualMachineConfiguration;
            this.userAccounts = pool.userAccounts;
            this.changeDetector.markForCheck();
        });
    }

    public dtoToForm(job: JobCreateDto) {
        return jobToFormModel(job);
    }

    public formToDto(data: any): JobCreateDto {
        return createJobFormToJsonData(data);
    }

    @autobind()
    public submit(data: JobCreateDto): Observable<any> {
        const id = data.id;
        const obs = this.jobService.add(data);
        obs.subscribe({
            next: () => {
                this.jobService.onJobAdded.next(id);
                this.notificationService.success("Job added!", `Job '${id}' was created successfully!`);
            },
            error: () => null,
        });

        return obs;
    }

    public preSelectPool(poolId: string) {
        this.form.patchValue({ poolInfo: { poolId } });
    }

    public get showJobConfiguration() {
        return !this.form.controls.jobManagerTask.disabled
            || !this.form.controls.jobPreparationTask.disabled
            || !this.form.controls.jobReleaseTask.disabled;
    }

    public get showPoolPicker() {
        return !this.form.controls.poolInfo.disabled;
    }

    public resetJobPreparationTask() {
        this.showJobReleaseTask = false;
        const jobReleaseTask = this.form.controls.jobReleaseTask;
        jobReleaseTask.setValue(null);
    }
}
