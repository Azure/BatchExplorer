import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { SidebarRef } from "../../../base/sidebar";
import { RangeValidatorDirective } from "app/components/base/validation";
import { Task } from "app/models";
import { createTaskFormToJsonData, taskToFormModel } from "app/models/forms";
import { TaskService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bex-task-create-basic-dialog",
    template: require("./task-create-basic-dialog.html"),
})
export class TaskCreateBasicDialogComponent {
    public jobId: string;
    public createTaskForm: FormGroup;
    public constraintsGroup: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private sidebarRef: SidebarRef<TaskCreateBasicDialogComponent>,
        private taskService: TaskService) {

        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
            maxTaskRetryCount: [
                0,
                new RangeValidatorDirective(validation.range.retry.min, validation.range.retry.max).validator,
            ],
        });

        this.createTaskForm = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.id),
                Validators.pattern(validation.regex.id),
            ]],
            displayName: ["", Validators.maxLength(validation.maxLength.displayName)],
            commandLine: ["", Validators.required],
            constraints: this.constraintsGroup,
            runElevated: ["0"],
        });
    }

    public setValue(task: Task) {
        this.createTaskForm.patchValue(taskToFormModel(task));
    }

    @autobind()
    public submit(): Observable<any> {
        const jsonData = createTaskFormToJsonData(this.createTaskForm.value);
        const onAddedParams = { jobId: this.jobId, id: this.createTaskForm.value.id };
        const observable = this.taskService.add(this.jobId, jsonData, {});
        observable.subscribe({
            next: () => { this.taskService.onTaskAdded.next(onAddedParams); },
            error: (error) => { console.error("taskService.add() :: error: ", JSON.stringify(error)); },
        });

        return observable;
    }
}
