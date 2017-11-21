import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { ComplexFormConfig } from "app/components/base/form";
import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { RangeValidatorDirective } from "app/components/base/validation";
import { DynamicForm } from "app/core";
import { Task } from "app/models";
import { TaskCreateDto } from "app/models/dtos";
import { createTaskFormToJsonData, taskToFormModel } from "app/models/forms";
import { TaskService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bl-task-create-basic-dialog",
    templateUrl: "task-create-basic-dialog.html",
})
export class TaskCreateBasicDialogComponent extends DynamicForm<Task, TaskCreateDto> {
    public jobId: string;
    public complexFormConfig: ComplexFormConfig;
    public constraintsGroup: FormGroup;
    public resourceFiles: FormArray;
    public hasLinkedStorage: boolean = true;
    public title = "Add task";
    public subtitle = "Adds a task to the selected job";
    public multiUse = true;
    public actionName = "Add";
    public fileUri = "create.task.batch.json";

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<TaskCreateBasicDialogComponent>,
        protected taskService: TaskService,
        private notificationService: NotificationService) {
        super(TaskCreateDto);
        this._setComplexFormConfig();

        this.hasLinkedStorage = true;
        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
            maxWallClockTime: null,
            maxTaskRetryCount: [
                0,
                new RangeValidatorDirective(validation.range.retry.min, validation.range.retry.max).validator,
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
            fileGroups: [[]],
            resourceFiles: [[]],
            environmentSettings: [[]],
            appPackages: [[]],
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

    public handleHasLinkedStorage(hasLinkedStorage) {
        this.hasLinkedStorage = hasLinkedStorage;
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
