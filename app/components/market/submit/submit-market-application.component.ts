import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";

import { NcjJobTemplate, NcjParameter, ServerError } from "app/models";
import { NcjTemplateService, PythonRpcService } from "app/services";
import { ObjectUtils, log } from "app/utils";
import * as inflection from "inflection";
import "./submit-market-application.scss";

enum NcjParameterExtendedType {
    string = "string",
    int = "int",
    fileGroup = "file-group",
    fileInFileGroup = "file-in-file-group",
}

/*
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
export class SubmitMarketApplicationComponent implements OnInit {
    public static breadcrumb() {
        return { name: "Submit" };
    }

    public NcjParameterExtendedType = NcjParameterExtendedType;

    //public jobNameParam: NcjParameterWrapper;

    public applicationId: string;
    public actionId: string;
    public title = "";
    public jobTemplate: NcjJobTemplate;
    public poolTemplate;
    public form: FormGroup;
    public jobFormGroup: FormGroup;
    public pickedPool = new FormControl(null);
    //public otherParameters: NcjParameterWrapper[];
    public error: ServerError;

    private _formValue: any;

    private mode_state;

    // Constructor create data structure from reading json files
    constructor(
        public formBuilder: FormBuilder,
        private pythonRpcService: PythonRpcService,
        private route: ActivatedRoute,
        private router: Router,
        private templateService: NcjTemplateService) {
             this.mode_state = "None";
        }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this._updateTitle();
            this._getTemplates();
        });
/*
        this.route.queryParams.subscribe((params) => {
            if (params.formParams) {
                try {
                    const value = JSON.parse(params.formParams);
                    this._formValue = value;
                    this.form.setValue(value);
                } catch (e) {
                    log.warn("Invalid form param. Not valid json.", params.formParams as any);
                }
            }
        });
*/
    }

    public createForms() {
        let parameterKeys = Object.keys(this.jobTemplate.parameters);
        let fg = {};
        for (let key of parameterKeys) {
            if ("defaultValue" in this.jobTemplate.parameters[key]) {
                const defaultValue = String(this.jobTemplate.parameters[key].defaultValue);
                fg[key] = new FormControl(defaultValue);
            } else {
                fg[key] = new FormControl();
            }
        }
        this.jobFormGroup = this.formBuilder.group(fg);

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

    @autobind()
    public submit() {
        this.error = null;
        const jobParams = this.jobFormGroup.value;
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

    /*
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
    */

    private _updateTitle() {
        this.title = `Run ${this.actionId} from ${this.applicationId}`;
    }
}
