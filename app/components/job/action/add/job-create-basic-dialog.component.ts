import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { ComplexFormConfig } from "app/components/base/form";
import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { RangeValidatorDirective } from "app/components/base/validation";
import { DynamicForm } from "app/core";
import { AllTasksCompleteAction, Job, TaskFailureAction } from "app/models";
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
    public AllTasksCompleteAction = AllTasksCompleteAction;
    public TaskFailureAction = TaskFailureAction;
    public complexFormConfig: ComplexFormConfig;
    public constraintsGroup: FormGroup;
    public showJobReleaseTask: boolean;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<JobCreateBasicDialogComponent>,
        private jobService: JobService,
        poolService: PoolService,
        private notificationService: NotificationService) {
        super(JobCreateDto);
        this._setComplexFormConfig();

        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
            maxWallClockTime: null,
            maxTaskRetryCount: [
                0,
                new RangeValidatorDirective(validation.range.retry.min, validation.range.retry.max).validator,
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
                new RangeValidatorDirective(validation.range.priority.min, validation.range.priority.max).validator,
            ],
            constraints: this.constraintsGroup,
            poolInfo: [null, Validators.required],
            jobManagerTask: null,
            jobPreparationTask: null,
            jobReleaseTask: null,
            onAllTasksComplete: [AllTasksCompleteAction.noaction],
            onTaskFailure: [TaskFailureAction.noaction],
        });

        this.form.controls.jobPreparationTask.valueChanges.subscribe((value) => {
            this.showJobReleaseTask = value && value.id;
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

    public resetJobPreparationTask() {
        this.showJobReleaseTask = false;
        let jobReleaseTask =  this.form.controls.jobReleaseTask;
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
