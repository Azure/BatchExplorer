import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";

import { FormBaseComponent } from "app/components/base/form";
import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { RangeValidatorDirective } from "app/components/base/validation";
import { Task } from "app/models";
import { CreateTaskModel } from "app/models/forms";
import { createTaskFormToJsonData, taskToFormModel } from "app/models/forms";
import { TaskService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bex-task-create-basic-dialog",
    templateUrl: "task-create-basic-dialog.html",
})
export class TaskCreateBasicDialogComponent extends FormBaseComponent<Task, CreateTaskModel> {
    public jobId: string;
    public constraintsGroup: FormGroup;
    public resourceFiles: FormArray;

    public title = "Add task";
    public subtitle = "Adds a task to the selected job";
    public multiUse = true;
    public actionName = "Add";

    constructor(
        private formBuilder: FormBuilder,
        private sidebarRef: SidebarRef<TaskCreateBasicDialogComponent>,
        protected taskService: TaskService,
        private notificationService: NotificationService) {
        super();

        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
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
            commandLine: ["", Validators.required],
            constraints: this.constraintsGroup,
            runElevated: ["0"],
            resourceFiles: [[]],
        });
    }

    public execute(): Observable<any> {
        const value = this.form.getRawValue();
        const id = value.id;

        const jsonData = createTaskFormToJsonData(value);
        const onAddedParams = { jobId: this.jobId, id };
        const observable = this.taskService.add(this.jobId, jsonData, {});
        observable.subscribe({
            next: () => {
                this.notificationService.success("Task added!", `Task '${id}' was created successfully!`);
                this.taskService.onTaskAdded.next(onAddedParams);
            },
            error: (error) => null,
        });

        return observable;
    }

    protected entityToForm(task: Task) {
        return taskToFormModel(task);
    }
}
