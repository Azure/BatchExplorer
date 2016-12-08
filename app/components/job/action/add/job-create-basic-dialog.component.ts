import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { RangeValidatorDirective } from "app/components/base/validation";
import { Job, Pool } from "app/models";
import { createJobFormToJsonData, jobToFormModel } from "app/models/forms";
import { JobService, PoolService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Constants } from "app/utils";
import { SidebarRef } from "../../../base/sidebar";

@Component({
    selector: "bex-job-create-basic-dialog",
    templateUrl: "job-create-basic-dialog.html",
})
export class JobCreateBasicDialogComponent implements OnInit {
    public poolsData: RxListProxy<{}, Pool>;
    public createJobForm: FormGroup;
    public constraintsGroup: FormGroup;
    public poolInfoGroup: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<JobCreateBasicDialogComponent>,
        private jobService: JobService,
        private poolService: PoolService) {

        this.poolsData = this.poolService.list();
        const validation = Constants.forms.validation;
        this.constraintsGroup = this.formBuilder.group({
            maxTaskRetryCount: [
                0,
                new RangeValidatorDirective(validation.range.retry.min, validation.range.retry.max).validator,
            ],
        });

        this.poolInfoGroup = this.formBuilder.group({
            poolId: ["", Validators.required],
        });

        this.createJobForm = this.formBuilder.group({
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
            poolInfo: this.poolInfoGroup,
        });
    }

    public ngOnInit() {
        this.poolsData.fetchNext().subscribe((result) => {
            if (result.data && result.data.length > 0) {
                this.createJobForm.value.poolId = result.data[0].id;
            }
        });
    }

    public setValue(job: Job) {
        this.createJobForm.patchValue(jobToFormModel(job));
    }

    @autobind()
    public submit(): Observable<any> {
        const jsonData = createJobFormToJsonData(this.createJobForm.value);
        const observable = this.jobService.add(jsonData, {});
        observable.subscribe(() => this.jobService.onJobAdded.next(this.createJobForm.value.id));

        return observable;
    }

    public preSelectPool(poolId: string) {
        this.createJobForm.patchValue({ poolInfo: { poolId } });
    }
}
