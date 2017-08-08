import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup } from "@angular/forms"
import { NcjTemplateService, PythonRpcService } from "app/services";
import "./submit-market-application.scss";

@Component({
    selector: "bl-submit-market-application",
    templateUrl: "submit-market-application.html",
})
export class SubmitMarketApplicationComponent {
    public static breadcrumb() {
        return { name: "Submit" };
    }
    title;
    form;
    mode_state;
    applicationId;
    actionId;
    jobTemplate;
    poolTemplate;
    pickedPool = new FormControl(null);
    error;

    constructor(
        public formBuilder: FormBuilder,
        private pythonRpcService: PythonRpcService,
        private route: ActivatedRoute,
        private router: Router,
        private templateService: NcjTemplateService) {
             this.mode_state = "None";
             this.form = new FormGroup({"a": new FormControl()});
    }
    ngOnInit() {
        console.log("Form", this.form);
        this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this.templateService.getTemplates(this.applicationId, this.actionId).subscribe((templates) => {
                this.jobTemplate = templates.job;
                this.poolTemplate = templates.pool;
                console.log("JobTemplate",this.jobTemplate);
                console.log("PoolTemplate",this.poolTemplate);
                this.title = `Run ${this.actionId} from ${this.applicationId}`;
                this.createForms();
            });
        });
    }
    createForms() {
        let jobParameters = [];
        let poolParameters = [];
        if (this.jobTemplate && this.jobTemplate.parameters){
            jobParameters = Object.keys(this.jobTemplate.parameters);
        }
        if (this.poolTemplate && this.poolTemplate.parameters){
            poolParameters = Object.keys(this.poolTemplate.parameters);
        }
        let fg = {};

        for (let key of jobParameters) {
            if ("defaultValue" in this.jobTemplate.parameters[key]) {
                const defaultValue = String(this.jobTemplate.parameters[key].defaultValue);
                fg[key] = new FormControl(defaultValue);
            } else {
                fg[key] = new FormControl();
            }
        }
        for (let key of poolParameters) {
            if ("defaultValue" in this.poolTemplate.parameters[key]) {
                const defaultValue = String(this.poolTemplate.parameters[key].defaultValue);
                fg[key] = new FormControl(defaultValue);
            } else {
                fg[key] = new FormControl();
            }
        }
        this.form = new FormGroup(fg);
    }

    runJobWithPool(expandedPoolTemplate, jobInputs){
        delete expandedPoolTemplate.id;
        this.jobTemplate.job.properties.poolInfo = {
            autoPoolSpecification: {
            autoPoolIdPrefix: "jobname",
            poolLifetimeOption: "job",
            keepAlive: false,
            pool: expandedPoolTemplate
            }
        };
        console.log(this.jobTemplate);
        const obs = this.pythonRpcService.callWithAuth("submit-ncj-job", [this.jobTemplate, jobInputs]);
        obs.subscribe({
            next: (data) => this._redirectToJob(),
            error: (err) => console.log("Error: ",err),
        });
    }

    onSubmit(){
        this.error = null;
        let jobInputs = {};
        let poolInputs = {};
        for (let param of Object.keys(this.form.controls)) {
            console.log(param);
            if (this.getParameters(this.jobTemplate).includes(param)){
                jobInputs[param] = this.form.controls[param].value;
            }
            else if(this.getParameters(this.poolTemplate).includes(param)){
                poolInputs[param] = this.form.controls[param].value;
            }
        }
        if (this.mode_state === "PoolNJob"){
            const obs = this.pythonRpcService.callWithAuth("get-ncj-pool", [this.poolTemplate,poolInputs]);
            obs.subscribe({
                next: (data) => this.runJobWithPool(data, jobInputs),
                error: (err) => console.log("Error: ",err),
            });
            console.log(this.pickedPool.value);
        }
        else if (this.mode_state === "PoolOJob"){
            this.jobTemplate.job.properties.poolInfo = this.pickedPool.value;
            console.log(this.pickedPool.value);
            console.log(this.jobTemplate);
            const obs = this.pythonRpcService.callWithAuth("submit-ncj-job", [this.jobTemplate, jobInputs]);
            obs.subscribe({
                next: (data) => this._redirectToJob(),
                error: (err) => console.log("Error: ",err),
            });
        }
        else if (this.mode_state === "Pool"){
            const obs = this.pythonRpcService.callWithAuth("create-ncj-pool", [this.poolTemplate, poolInputs]);
            obs.subscribe({
                next: (data) => this._redirectToPool(),
                error: (err) => console.log("Error: ", err),
            });
        }

    }

    private _redirectToJob() {
        this.router.navigate(["/jobs"]);
    }
    private _redirectToPool() {
        this.router.navigate(["/pools"]);
    }

    public getContainerFromFileGroup(fileGroup: string) {
        return fileGroup && `fgrp-${fileGroup}`;
    }
    getType(param){
        if (this.getParameters(this.jobTemplate).includes(param)){
            if (this.jobTemplate.parameters[param].metadata.advancedType){
                return this.jobTemplate.parameters[param].metadata.advancedType;
            }
            else if (this.jobTemplate.parameters[param].allowedValues){
                return "dropdown";
            }
            return this.jobTemplate.parameters[param].type;
        }
        else if (this.getParameters(this.poolTemplate).includes(param)){
            if (this.poolTemplate.parameters[param].metadata.advancedType){
                return this.poolTemplate.parameters[param].metadata.advancedType;
            }
            else if (this.poolTemplate.parameters[param].allowedValues){
                return "dropdown";
            }
            return this.poolTemplate.parameters[param].type;
        }
        else{
            return "string";
        }
    }
    getParameters(template){
        if (!template || !template.parameters){
            return [];
        }
        return Object.keys(template.parameters);
    }
}
