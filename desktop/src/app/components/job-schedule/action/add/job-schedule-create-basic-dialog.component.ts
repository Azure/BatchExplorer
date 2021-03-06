import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicForm, autobind } from "@batch-flask/core";
import { ComplexFormConfig } from "@batch-flask/ui/form";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { JobSchedule } from "app/models";
import { JobScheduleCreateDto } from "app/models/dtos";
import { createJobScheduleFormToJsonData, jobScheduleToFormModel } from "app/models/forms";
import { JobScheduleService } from "app/services";
import { Constants } from "common";
import { Observable } from "rxjs";

import "./job-schedule-create-basic-dialog.scss";

@Component({
    selector: "bl-job-schedule-create-basic-dialog",
    templateUrl: "job-schedule-create-basic-dialog.html",
})
export class JobScheduleCreateBasicDialogComponent extends DynamicForm<JobSchedule, JobScheduleCreateDto> {
    public complexFormConfig: ComplexFormConfig;
    public scheduleGroup: FormGroup;
    public title = "Create job schedule";
    public fileUri = "create.jobschedule.batch.json";

    constructor(
        public formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<JobScheduleCreateBasicDialogComponent>,
        public jobScheduleService: JobScheduleService,
        public notificationService: NotificationService) {
        super(JobScheduleCreateDto);
        this._setComplexFormConfig();

        const validation = Constants.forms.validation;
        this.scheduleGroup = this.formBuilder.group({
            doNotRunAfter: null,
            doNotRunUntil: null,
            recurrenceInterval: null,
            startWindow: null,
        });

        this.form = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.id),
                Validators.pattern(validation.regex.id),
            ]],
            displayName: ["", Validators.maxLength(validation.maxLength.displayName)],
            schedule: this.scheduleGroup,
            jobSpecification: null,
            metadata: [null],
        });
    }

    public dtoToForm(jobSchedule: JobScheduleCreateDto) {
        return jobScheduleToFormModel(jobSchedule);
    }

    public formToDto(data: any): JobScheduleCreateDto {
        return createJobScheduleFormToJsonData(data);
    }

    @autobind()
    public submit(data: JobScheduleCreateDto): Observable<any> {
        const id = data.id;
        const obs = this.jobScheduleService.add(data);
        obs.subscribe({
            next: () => {
                this.jobScheduleService.onJobScheduleAdded.next(id);
                this.notificationService.success("Job schedule added!",
                    `Job schedule '${id}' was created successfully!`);
            },
            error: (response: Response) => {
                this.notificationService.error(
                    "Job schedule creation failed",
                    response.toString(),
                );
            },
        });

        return obs;
    }

    private _setComplexFormConfig() {
        this.complexFormConfig = {
            jsonEditor: {
                dtoType: JobScheduleCreateDto,
                toDto: (value) => this.formToDto(value),
                fromDto: (value) => this.dtoToForm(value),
            },
        };
    }
}
