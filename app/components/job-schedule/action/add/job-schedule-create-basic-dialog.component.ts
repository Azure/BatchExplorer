import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";

import { ComplexFormConfig } from "app/components/base/form";
import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm, autobind } from "app/core";
import { JobSchedule } from "app/models";
import { JobScheduleCreateDto } from "app/models/dtos";
import { createJobScheduleFormToJsonData, jobScheduleToFormModel } from "app/models/forms";
import { JobScheduleService } from "app/services";
import { Constants } from "app/utils";

import "./job-schedule-create-basic-dialog.scss";

@Component({
    selector: "bl-job-schedule-create-basic-dialog",
    templateUrl: "job-schedule-create-basic-dialog.html",
})
export class JobScheduleCreateBasicDialogComponent extends DynamicForm<JobSchedule, JobScheduleCreateDto> {
    public complexFormConfig: ComplexFormConfig;
    public scheduleGroup: FormGroup;
    public fileUri = "create.jobschedule.batch.json";

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<JobScheduleCreateBasicDialogComponent>,
        private jobScheduleService: JobScheduleService,
        private notificationService: NotificationService) {
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
            error: () => null,
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
