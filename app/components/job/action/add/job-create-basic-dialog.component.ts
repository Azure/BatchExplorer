import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { List } from "immutable";
import { Observable } from "rxjs";

import { DynamicForm, autobind } from "@batch-flask/core";
import { ComplexFormConfig } from "@batch-flask/ui/form";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { RangeValidator } from "@batch-flask/ui/validation";
import { AllTasksCompleteAction, Job, TaskFailureAction, UserAccount, VirtualMachineConfiguration } from "app/models";
import { JobCreateDto } from "app/models/dtos";
import { createJobFormToJsonData, jobToFormModel } from "app/models/forms";
import { JobService, PoolService } from "app/services";
import { Constants } from "app/utils";

import "./job-create-basic-dialog.scss";

@Component({
    selector: "bl-job-create-basic-dialog",
    templateUrl: "job-create-basic-dialog.html",
})
export class JobCreateBasicDialogComponent extends DynamicForm<Job, JobCreateDto> {
    public userAccounts: List<UserAccount>;
    public AllTasksCompleteAction = AllTasksCompleteAction;
    public TaskFailureAction = TaskFailureAction;
    public complexFormConfig: ComplexFormConfig;
    public constraintsGroup: FormGroup;
    public showJobReleaseTask: boolean;
    public title = "Create job";
    public subtitle = null;
    public fileUri = "create.job.batch.json";
    public virtualMachineConfiguration: VirtualMachineConfiguration = null;
    public containerSettingsRequired: boolean = true;

    constructor(
        public formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<JobCreateBasicDialogComponent>,
        public jobService: JobService,
        poolService: PoolService,
        public notificationService: NotificationService) {
        super(JobCreateDto);
        this._setComplexFormConfig();

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
        });

        this.form.controls.jobPreparationTask.valueChanges.subscribe((value) => {
            this.showJobReleaseTask = value && value.id;
        });

        // Load current pool container configuration to indicate whether job manager, preparation and release task
        // displays task container setting accordingly
        this.form.controls.poolInfo.valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .flatMap(pool => pool ? poolService.get(pool.poolId) : of(null))
            .subscribe(pool => {
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

                this.userAccounts = pool.userAccounts;
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

    public get jobManagerTask() {
        return this.form.controls.jobManagerTask.value;
    }

    public get jobPreparationTask() {
        return this.form.controls.jobPreparationTask.value;
    }

    public get jobReleaseTask() {
        return this.form.controls.jobReleaseTask.value;
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

    private _setComplexFormConfig() {
        this.complexFormConfig = {
            jsonEditor: {
                dtoType: JobCreateDto,
                toDto: (value) => this.formToDto(value),
                fromDto: (value) => this.dtoToForm(value),
            },
        };
    }
}
