import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ServerError } from "app/models";
import { NcjTemplateService, PythonRpcService } from "app/services";

import "./submit-market-application.scss";
export enum Modes { None, NewPoolAndJob, OldPoolAndJob, NewPool }

@Component({
    selector: "bl-submit-market-application",
    templateUrl: "submit-market-application.html",
})
export class SubmitMarketApplicationComponent {
    public static breadcrumb() {
        return { name: "Submit" };
    }

    public modes = Modes;
    private title;
    private form;
    private modeState = Modes.None;
    private applicationId;
    private actionId;
    private icon;
    private jobTemplate;
    private poolTemplate;
    private pickedPool = new FormControl(null);
    private error;
    private jobParams;
    private poolParams;

    constructor(
        public formBuilder: FormBuilder,
        private pythonRpcService: PythonRpcService,
        private route: ActivatedRoute,
        private router: Router,
        private templateService: NcjTemplateService) {
             this.form = new FormGroup({});
    }
    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this.templateService.getTemplates(this.applicationId, this.actionId).subscribe((templates) => {
                this.jobTemplate = templates.job;
                this.poolTemplate = templates.pool;
                this.title = `Run ${this.actionId} from ${this.applicationId}`;
                this._createForms();
            });
            this.templateService.getApplication(this.applicationId).subscribe((application) => {
                this.icon = application.icon;
            });
        });
    }
    private _createForms() {
        let jobParameters = [];
        let poolParameters = [];
        if (this.jobTemplate && this.jobTemplate.parameters){
            jobParameters = Object.keys(this.jobTemplate.parameters);
        }
        if (this.poolTemplate && this.poolTemplate.parameters){
            poolParameters = Object.keys(this.poolTemplate.parameters);
        }
        let jobFormGroup = {};
        for (let key of jobParameters) {
            if (this.jobTemplate.parameters[key].defaultValue) {
                const defaultValue = String(this.jobTemplate.parameters[key].defaultValue);
                jobFormGroup[key] = new FormControl(defaultValue);
            } else {
                jobFormGroup[key] = new FormControl();
            }
        }
        this.jobParams = new FormGroup(jobFormGroup);

        let poolFormGroup = {};
        for (let key of poolParameters) {
            if ("defaultValue" in this.poolTemplate.parameters[key]) {
                const defaultValue = String(this.poolTemplate.parameters[key].defaultValue);
                poolFormGroup[key] = new FormControl(defaultValue);
            } else {
                poolFormGroup[key] = new FormControl();
            }
        }
        this.poolParams = new FormGroup(poolFormGroup);
        this.form = this.formBuilder.group({pool: this.poolParams, job: this.jobParams});
    }

    private _runJobWithPool(expandedPoolTemplate, jobInputs){
        delete expandedPoolTemplate.id;
        this.jobTemplate.job.properties.poolInfo = {
            autoPoolSpecification: {
            autoPoolIdPrefix: "jobname",
            poolLifetimeOption: "job",
            keepAlive: false,
            pool: expandedPoolTemplate,
            },
        };
        const obs = this.pythonRpcService.callWithAuth("submit-ncj-job", [this.jobTemplate, jobInputs]);
        obs.subscribe({
            next: (data) => this._redirectToJob(data.id),
            error: (err) => this.error = ServerError.fromPython(err),
        });
    }

    private _onSubmit(){
        this.error = null;
        if (this.modeState === Modes.NewPoolAndJob) {
            const obs = this.pythonRpcService.callWithAuth("expand-ncj-pool", [this.poolTemplate, this.poolParams.value]);
            obs.subscribe({
                next: (data) => this._runJobWithPool(data, this.jobTemplate),
                error: (err) => this.error = ServerError.fromPython(err),
            });
        }
        else if (this.modeState === Modes.OldPoolAndJob) {
            this.jobTemplate.job.properties.poolInfo = this.pickedPool.value;
            const obs = this.pythonRpcService.callWithAuth("submit-ncj-job", [this.jobTemplate, this.jobParams.value]);
            obs.subscribe({
                next: (data) => this._redirectToJob(data.id),
                error: (err) => this.error = ServerError.fromPython(err),
            });
        }
        else if (this.modeState === Modes.NewPool) {
            const obs = this.pythonRpcService.callWithAuth("create-ncj-pool", [this.poolTemplate, this.poolParams.value]);
            obs.subscribe({
                next: (data) => this._redirectToPool(data.id),
                error: (err) => this.error = ServerError.fromPython(err),
            });
        }
    }

    private _redirectToJob(id) {
        if (id) {
            this.router.navigate(["/jobs", id]);
        }
        this.router.navigate(["/jobs"]);
    }
    private _redirectToPool(id) {
        if (id) {
            this.router.navigate(["/pools", id]);
        }
    }

    public _getContainerFromFileGroup(fileGroup: string) {
        return fileGroup && `fgrp-${fileGroup}`;
    }

    private _getType(param){
        if (this._getParameters(this.jobTemplate).includes(param)){
            if (this.jobTemplate.parameters[param].metadata.advancedType){
                return this.jobTemplate.parameters[param].metadata.advancedType;
            }
            else if (this.jobTemplate.parameters[param].allowedValues){
                return "dropdown";
            }
            return this.jobTemplate.parameters[param].type;
        }
        else if (this._getParameters(this.poolTemplate).includes(param)){
            if (this.poolTemplate.parameters[param].metadata.advancedType){
                return this.poolTemplate.parameters[param].metadata.advancedType;
            }
            else if (this.poolTemplate.parameters[param].allowedValues){
                return "dropdown";
            }
            return this.poolTemplate.parameters[param].type;
        }
        else {
            return "string";
        }
    }
    private _getParameters(template){
        if (!template || !template.parameters){
            return [];
        }
        return Object.keys(template.parameters);
    }
}
