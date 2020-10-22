import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicForm, I18nService, autobind } from "@batch-flask/core";
import { ComplexFormConfig } from "@batch-flask/ui/form";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { RangeValidator } from "@batch-flask/ui/validation";
import { UploadResourceFileEvent } from "app/components/task/base";
import { Task, VirtualMachineConfiguration } from "app/models";
import { TaskCreateDto } from "app/models/dtos";
import { createTaskFormToJsonData, taskToFormModel } from "app/models/forms";
import { JobService, PoolService, TaskService } from "app/services";
import { Constants } from "common";
import { Observable } from "rxjs";

@Component({
    selector: "bl-add-task-form",
    templateUrl: "add-task-form.html",
})
export class AddTaskFormComponent extends DynamicForm<Task, TaskCreateDto> implements OnInit {
    public title: string;
    public subtitle: string;
    public actionName: string;

    public jobId: string;
    public complexFormConfig: ComplexFormConfig;
    public constraintsGroup: FormGroup;
    public resourceFiles: FormArray;
    public multiUse = true;
    public fileUri = "create.task.batch.json";
    public virtualMachineConfiguration: VirtualMachineConfiguration = null;
    public userAccounts: any[] = [];

    constructor(
        i18n: I18nService,
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<AddTaskFormComponent>,
        protected taskService: TaskService,
        private notificationService: NotificationService,
        protected jobService: JobService,
        protected poolService: PoolService) {
        super(TaskCreateDto);
        this._setComplexFormConfig();

        this.title = i18n.t("add-task-form.title");
        this.subtitle = i18n.t("add-task-form.subtitle");
        this.actionName = i18n.t("add-task-form.action");

        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
            maxWallClockTime: null,
            maxTaskRetryCount: [
                0,
                new RangeValidator(validation.range.retry.min, validation.range.retry.max).validator,
            ],
            retentionTime: null,
        });

        this.form = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.id),
                Validators.pattern(validation.regex.id),
            ]],
            displayName: ["", Validators.maxLength(validation.maxLength.displayName)],
            commandLine: ["", Validators.required],
            constraints: this.constraintsGroup,
            userIdentity: [null],
            requiredSlots: [1, [Validators.required, Validators.min(1)]],
            fileGroups: [[]],
            resourceFiles: [[]],
            environmentSettings: [[]],
            appPackages: [[]],
            containerSettings: [null],
            multiInstanceSettings: [null],
        });
    }

    public ngOnInit(): void {
        this.jobService.get(this.jobId).subscribe((job) => {
            const jobData = job.toJS();
            if (jobData.poolInfo && jobData.poolInfo.poolId) {
                this.poolService.get(jobData.poolInfo.poolId).subscribe((pool) => {
                    const poolData = pool.toJS();
                    this.virtualMachineConfiguration = poolData.virtualMachineConfiguration;
                    this.userAccounts = poolData.userAccounts;
                });
            }
        });
    }

    public dtoToForm(task: TaskCreateDto) {
        return taskToFormModel(task);
    }

    public formToDto(data: any): TaskCreateDto {
        return createTaskFormToJsonData(data);
    }

    @autobind()
    public submit(data: TaskCreateDto): Observable<any> {
        const id = data.id;
        const onAddedParams = { jobId: this.jobId, id };
        const observable = this.taskService.add(this.jobId, data, {});
        observable.subscribe({
            next: () => {
                this.notificationService.success("Task added!", `Task '${id}' was created successfully!`);
                this.taskService.onTaskAdded.next(onAddedParams);
            },
            error: (error) => null,
        });

        return observable;
    }

    public registerFileUpload(event: UploadResourceFileEvent) {
        this.registerAsyncTask(`Uploading file ${event.filename}`, event.done);
    }

    private _setComplexFormConfig() {
        this.complexFormConfig = {
            jsonEditor: {
                dtoType: TaskCreateDto,
                toDto: (value) => this.formToDto(value),
                fromDto: (value) => this.dtoToForm(value),
            },
        };
    }
}
