import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { FormsModule } from "@angular/forms"
import { ReactiveFormsModule } from "@angular/forms"
import { FormGroup, FormControl } from "@angular/forms"


import { NcjJobTemplate, NcjParameter, ServerError } from "app/models";
import { NcjTemplateService, PythonRpcService } from "app/services";
import { ObjectUtils, log } from "app/utils";
import * as inflection from "inflection";
import "./submit-market-application.scss";
/*
enum NcjParameterExtendedType {
    string = "string",
    int = "int",
    fileGroup = "file-group",
    fileInFileGroup = "file-in-file-group",
}


class NcjParameterWrapper {
    public type: NcjParameterExtendedType;
    /**
     * Id of another param it depends on

    public dependsOn: string;

    public name: string;
    public description: string;

    constructor(public id: string, private _param: NcjParameter) {
        this._computeName();
        this._computeDescription();
        this._computeType();
    }

    private _computeName() {
        this.name = inflection.humanize(inflection.underscore(this.id));
    }

    private _computeDescription() {
        if (this._param.metadata && this._param.metadata.description) {
            this.description = this._param.metadata.description;
        }
    }

    private _computeDependsOn() {
        if (this._param.metadata && this._param.metadata.dependsOn) {
            this.dependsOn = this._param.metadata.dependsOn;
        }
    }

    private _computeType() {
        this._computeDependsOn();

        const param = this._param;
        if (param.metadata && param.metadata.advancedType) {
            const type = param.metadata.advancedType;
            if (!ObjectUtils.values(NcjParameterExtendedType as any).includes(type)) {
                log.error(`Advanced typed '${type}' is unkown!`, NcjParameterExtendedType);
            }
            this.type = type as NcjParameterExtendedType;
            return;
        }
        this.type = param.type as any;
    }
}

const ConventionNames = {
    jobName: "jobName",
};
*/
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
        console.log("Form",this.form);
        this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this.templateService.getTemplates(this.applicationId, this.actionId).subscribe((templates) => {
                this.jobTemplate = templates.job;
                this.poolTemplate = templates.pool;
                this.title = `Run ${this.actionId} from ${this.applicationId}`
                this.createForms();
            });
        });
    }
    createForms() {
        let jobParameters = Object.keys(this.jobTemplate.parameters);
        let poolParameters = Object.keys(this.poolTemplate.parameters);
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
        fg["pool"] = this.pickedPool;
        this.form = new FormGroup(fg);
    }
    onSubmit(){
        console.log("Form Submit",this.form.value);
    }
    getParameters(template){
        if (!template){
            return []
        }
        let parameterKeys = Object.keys(template.parameters);
        return parameterKeys;
        /*
        let result = [];
        for (let param of parameterKeys) {
            let type = template.parameters[param].type;
            if (template.parameters[param].metadata.advancedType){
                type= template.parameters[param].metadata.advancedType;
            }
            result.push({ "key" : param, "val" : template.parameters[param], "type" : template.parameters[param].type});
        }
        return result;
        */
    }






/*
    public NcjParameterExtendedType = NcjParameterExtendedType;

    //public jobNameParam: NcjParameterWrapper;

    public applicationId: string;
    public actionId: string;
    public title = "";
    public jobTemplate: NcjJobTemplate;
    public poolTemplate;
    form;
    public pickedPool = new FormControl(null);
    //public otherParameters: NcjParameterWrapper[];
    public error: ServerError;



    private mode_state;

    // Constructor create data structure from reading json files
    constructor(
        public formBuilder: FormBuilder,
        private pythonRpcService: PythonRpcService,
        private route: ActivatedRoute,
        private router: Router,
        private templateService: NcjTemplateService) {
             this.mode_state = "None";
             this.form = new FormGroup({});
        }

    ngOnInit() {
        this.form = new FormGroup({"a": new FormControl()});
        this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            //this._updateTitle();
            this._getTemplates();
        });
    }
    getParameters(template){
        if (!template){
            return []
        }
        let parameterKeys = Object.keys(template.parameters);
        let result = [];
        for (let param of parameterKeys) {
            let type = template.parameters[param].type;
            if (template.parameters[param].metadata.advancedType){
                type= template.parameters[param].metadata.advancedType;
            }
            result.push({ "key" : param, "val" : template.parameters[param], "type" : template.parameters[param].type});
        }
        return result;
    }



    public createForms() {
        let parameterKeys = Object.keys(this.jobTemplate.parameters);
        let parameterKeys2 = Object.keys(this.poolTemplate.parameters);

        let fg = {};
        for (let key of parameterKeys) {
            if ("defaultValue" in this.jobTemplate.parameters[key]) {
                const defaultValue = String(this.jobTemplate.parameters[key].defaultValue);
                fg[key] = new FormControl(defaultValue);
            } else {
                fg[key] = new FormControl();
            }
        }
        for (let key of parameterKeys2) {
            if ("defaultValue" in this.poolTemplate.parameters[key]) {
                const defaultValue = String(this.poolTemplate.parameters[key].defaultValue);
                fg[key] = new FormControl(defaultValue);
            } else {
                fg[key] = new FormControl();
            }
        }
        //fg["pool"] = this.pickedPool;
        this.form = new FormGroup(fg);





        //this.jobFormGroup = this.formBuilder.group(fg);

        //this.form = new FormGroup(fg);

        this.form = this.formBuilder.group({
            job: this.jobFormGroup,
            pool: this.pickedPool,
        });

        if (this._formValue) {
            this.form.setValue(this._formValue);
        }
        this.form.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((newFormValue) => {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    formParams: JSON.stringify(newFormValue),
                },
            });
        });

    }

    public getContainerFromFileGroup(fileGroup: string) {
        return fileGroup && `fgrp-${fileGroup}`;
    }

    onSubmit(item){
        console.log(item);
    }

    @autobind()
    public submit() {
        this.error = null;
        // RPC takes in Template JSON object and Parameter JSON object
        const obs = this.pythonRpcService.callWithAuth("submit-ncj-job", [this._buildJobTemplate(), jobParams]);
        obs.subscribe({
            next: (data) => this._redirectToJob(data),
            error: (err) => this.error = ServerError.fromPython(err),
        });
        return obs;
    }

    private _redirectToJob(data) {
        const jobId = data.properties.id;
        this.router.navigate(["/jobs", jobId]);
    }

    private _getTemplates() {
        this.templateService.getTemplates(this.applicationId, this.actionId).subscribe((templates) => {
            this.jobTemplate = templates.job;
            this.poolTemplate = templates.pool;
            //this._parseParameters();
            this.createForms();
        });
    }

    private _buildJobTemplate(): any {
        const template = { ...this.jobTemplate };
        //template.job.properties.poolInfo = this.pickedPool.value;
        return template;
    }


    private _parseParameters() {
        const parameters = this.jobTemplate.parameters;
        const otherParameters: any[] = [];
        for (let name of Object.keys(parameters)) {
            const param = parameters[name];
            if (name === ConventionNames.jobName) {
                this.jobNameParam = new NcjParameterWrapper(name, param);
            } else {
                otherParameters.push(new NcjParameterWrapper(name, param));
            }
        }
        this.otherParameters = otherParameters;
    }


    private _updateTitle() {
        this.title = `Run ${this.actionId} from ${this.applicationId}`;
    }
    */
}
