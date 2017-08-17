import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ServerError } from "app/models";
import { NcjJobTemplate, NcjParameter, NcjPoolTemplate } from "app/models";
import { NcjTemplateService, PythonRpcService } from "app/services";
import { ObjectUtils, log } from "app/utils";
import { autobind } from "core-decorators";
import * as inflection from "inflection";
import "./submit-market-application.scss";

enum Modes {
    None,
    NewPoolAndJob,
    OldPoolAndJob,
    NewPool,
}

enum NcjParameterExtendedType {
     string = "string",
     int = "int",
     fileGroup = "file-group",
     fileInFileGroup = "file-in-file-group",
     dropDown = "drop-down",
}

class NcjParameterWrapper {
    public type: NcjParameterExtendedType;
    public dependsOn: string;
    public name: string;
    public description: string;
    public allowedValues: string[];
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
    private _computeAllowedValues() {
        const param = this._param;
        if (param.allowedValues) {
            this.allowedValues = param.allowedValues;
        } else {
            this.allowedValues = [];
        }
    }
    private _computeType() {
        this._computeDependsOn();
        this._computeAllowedValues();
        const param = this._param;
        if (param.allowedValues) {
            this.type = NcjParameterExtendedType.dropDown;
            return;
        } else if (param.metadata && param.metadata.advancedType) {
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

@Component({
    selector: "bl-submit-market-application",
    templateUrl: "submit-market-application.html",
})
export class SubmitMarketApplicationComponent {
    public static breadcrumb() {
        return { name: "Submit" };
    }
    public modes = Modes;
    public types = NcjParameterExtendedType;
    public modeState = Modes.None;
    public title: string;
    public form: FormGroup;
    public jobTemplate: NcjJobTemplate;
    public poolTemplate: NcjPoolTemplate;
    public pickedPool = new FormControl(null);
    public jobParams: FormGroup;
    public poolParams: FormGroup;
    public jobParametersWrapper: NcjParameterWrapper[];
    public poolParametersWrapper: NcjParameterWrapper[];
    private applicationId: string;
    private actionId: string;
    private icon: string;
    private error: ServerError;

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
            this.title = `Run ${this.actionId} from ${this.applicationId}`;
            this.templateService.getTemplates(this.applicationId, this.actionId).subscribe((templates) => {
                this.jobTemplate = templates.job;
                this.poolTemplate = templates.pool;
                this._parseParameters();
                console.log(this.jobParametersWrapper);
                console.log(this.poolParametersWrapper);
                console.log(this.jobTemplate);
                console.log(this.poolTemplate);
                this._createForms();
            });
            this.templateService.getApplication(this.applicationId).subscribe((application) => {
                this.icon = application.icon;
            });
        });
    }

    public getContainerFromFileGroup(fileGroup: string) {
        return fileGroup && `fgrp-${fileGroup}`;
    }

    @autobind()
    public submit() {
        this.error = null;
        let obs;
        switch (this.modeState) {
            case Modes.NewPoolAndJob: {
                obs = this.pythonRpcService.callWithAuth("expand-ncj-pool", [this.poolTemplate, this.poolParams.value])
                    .cascade((data) => this._runJobWithPool(data));
                break;
            }
            case Modes.OldPoolAndJob: {
                this.jobTemplate.job.properties.poolInfo = this.pickedPool.value;
                obs = this.pythonRpcService.callWithAuth("submit-ncj-job", [this.jobTemplate, this.jobParams.value])
                    .cascade((data) => this._redirectToJob(data.properties.id));
                break;
            }
            case Modes.NewPool: {
                obs = this.pythonRpcService.callWithAuth("create-ncj-pool", [this.poolTemplate, this.poolParams.value])
                    .cascade((data) => this._redirectToPool(data.id));
                break;
            }
            default: {
                return obs;
            }
        }
        obs.subscribe({
            error: (err) => this.error = ServerError.fromPython(err),
        });
        return obs;
    }

    private _parseParameters() {
        const jobParameters = this.jobTemplate.parameters;
        const jobTempWrapper: any[] = [];
        for (let name of Object.keys(jobParameters)) {
            const param = jobParameters[name];
            jobTempWrapper.push(new NcjParameterWrapper(name, param));
        }
        this.jobParametersWrapper = jobTempWrapper;
        const poolParameters = this.poolTemplate.parameters;
        const poolTempWrapper: any[] = [];
        for (let name of Object.keys(poolParameters)) {
            const param = poolParameters[name];
            poolTempWrapper.push(new NcjParameterWrapper(name, param));
        }
        this.poolParametersWrapper = poolTempWrapper;
    }

    private _createForms() {
        let jobParameters = [];
        let poolParameters = [];
        if (this.jobTemplate && this.jobTemplate.parameters) {
            jobParameters = Object.keys(this.jobTemplate.parameters);
        }
        if (this.poolTemplate && this.poolTemplate.parameters) {
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
            if (this.poolTemplate.parameters[key].defaultValue) {
                const defaultValue = String(this.poolTemplate.parameters[key].defaultValue);
                poolFormGroup[key] = new FormControl(defaultValue);
            } else {
                poolFormGroup[key] = new FormControl();
            }
        }
        this.poolParams = new FormGroup(poolFormGroup);
        this.form = this.formBuilder.group({ pool: this.poolParams, job: this.jobParams });
    }

    private _runJobWithPool(expandedPoolTemplate) {
        const jobName: string = this.jobParams.value.jobName;
        delete expandedPoolTemplate.id;

        if (jobName) {
            this.jobTemplate.job.properties.poolInfo = {
                autoPoolSpecification: {
                    autoPoolIdPrefix: jobName,
                    poolLifetimeOption: "job",
                    keepAlive: false,
                },
                pool: expandedPoolTemplate,
            };
        } else {
            this.jobTemplate.job.properties.poolInfo = {
                autoPoolSpecification: {
                    autoPoolIdPrefix: "",
                    poolLifetimeOption: "job",
                    keepAlive: false,
                },
                pool: expandedPoolTemplate,
            };
        }
        return this.pythonRpcService.callWithAuth("submit-ncj-job", [this.jobTemplate, this.jobParams.value])
            .cascade((data) => this._redirectToJob(data.properties.id));
    }

    private _redirectToJob(id) {
        if (id) {
            this.router.navigate(["/jobs", id]);
        } else {
            this.router.navigate(["/jobs"]);
        }
    }

    private _redirectToPool(id) {
        if (id) {
            this.router.navigate(["/pools", id]);
        } else {
            this.router.navigate(["/pools"]);
        }
    }
}
