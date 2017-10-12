import { Component, Input, OnChanges } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NcjJobTemplate, NcjParameter, NcjPoolTemplate, ServerError } from "app/models";
import { PythonRpcService } from "app/services";
import { exists, log } from "app/utils";
import { Modes, NcjParameterWrapper } from "./market-application.model";
import "./submit-ncj-template.scss";

@Component({
    selector: "bl-submit-ncj-template",
    templateUrl: "submit-ncj-template.html",
})
export class SubmitNcjTemplateComponent implements OnChanges {
    @Input() public jobTemplate: NcjJobTemplate;
    @Input() public poolTemplate: NcjPoolTemplate;
    @Input() public title: string;

    public Modes = Modes;
    public modeState = Modes.None;
    public form: FormGroup;
    public multipleModes = false;

    public pickedPool = new FormControl(null, Validators.required);
    public jobParams: FormGroup;
    public poolParams: FormGroup;
    public jobParametersWrapper: NcjParameterWrapper[];
    public poolParametersWrapper: NcjParameterWrapper[];
    private error: ServerError;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private pythonRpcService: PythonRpcService) {
        this.form = new FormGroup({});
    }

    public ngOnChanges(changes) {
        this.multipleModes = Boolean(this.jobTemplate && this.poolTemplate);

        if (changes.jobTemplate || changes.poolTemplate) {
            if (!this.multipleModes) {
                this.modeState = this.poolTemplate ? Modes.NewPool : Modes.ExistingPoolAndJob;
            }

            this._processParameters();
            this._createForms();
        }
    }

    public get showPoolForm(): boolean {
        return this.modeState === Modes.NewPoolAndJob || this.modeState === Modes.NewPool;
    }

    public get showPoolPicker(): boolean {
        return this.modeState === Modes.ExistingPoolAndJob;
    }

    public get showJobForm(): boolean {
        return this.modeState === Modes.NewPoolAndJob || this.modeState === Modes.ExistingPoolAndJob;
    }

    public pickMode(mode: Modes) {
        this.modeState = mode;
    }

    public get submitToolTip(): string {
        if (this.isFormValid()) {
            return "Click to submit form";
        }
        return "Form is not valid";
    }

    public isFormValid() {
        return (this.modeState === Modes.NewPoolAndJob && this.jobParams.valid && this.poolParams.valid) ||
            (this.modeState === Modes.ExistingPoolAndJob && this.jobParams.valid && this.pickedPool.valid) ||
            (this.modeState === Modes.NewPool && this.poolParams.valid);
    }

    @autobind()
    public submit() {
        this.error = null;
        let method;
        const methods = {
            [Modes.NewPoolAndJob]: this._createJobWithAutoPool,
            [Modes.ExistingPoolAndJob]: this._createJob,
            [Modes.NewPool]: this._createPool,
        };
        method = methods[this.modeState];

        if (method) {
            const obs = method();
            obs.subscribe({
                error: (err) => this.error = err,
            });

            return obs;
        } else {
            log.error("Couldn't find how to submit this template.", { modeState: this.modeState });
            return Observable.of(null);
        }
    }

    @autobind()
    private _createJobWithAutoPool() {
        return this.pythonRpcService.callWithAuth("expand-ncj-pool", [this.poolTemplate, this.poolParams.value])
            .cascade((data) => this._runJobWithPool(data));
    }

    @autobind()
    private _createJob() {
        this.jobTemplate.job.properties.poolInfo = this.pickedPool.value;
        return this.pythonRpcService.callWithAuth("submit-ncj-job", [this.jobTemplate, this.jobParams.value])
            .cascade((data) => this._redirectToJob(data.properties.id));
    }

    @autobind()
    private _createPool() {
        return this.pythonRpcService.callWithAuth("create-ncj-pool", [this.poolTemplate, this.poolParams.value])
            .cascade((data) => this._redirectToPool(data.id));
    }

    private _processParameters() {
        if (!this.jobTemplate && !this.poolTemplate) {
            log.error("No template provided to the submit ncj template." +
                "You must provide at least one of job, pool or generic template.");
            return;
        }
        if (this.jobTemplate) {
            // Remove the poolId param as we are writting it manually
            if (this.jobTemplate.parameters.poolId) {
                delete this.jobTemplate.parameters.poolId;
            }
            this.jobParametersWrapper = this._parseParameters(this.jobTemplate.parameters);
        }
        if (this.poolTemplate) {
            this.poolParametersWrapper = this._parseParameters(this.poolTemplate.parameters);
        }
    }

    private _parseParameters(parameters: StringMap<NcjParameter>) {
        const wrapper: NcjParameterWrapper[] = [];
        for (let name of Object.keys(parameters)) {
            const param = parameters[name];
            wrapper.push(new NcjParameterWrapper(name, param));
        }
        return wrapper;
    }

    private _getFormGroup(template): FormGroup {
        let templateParameters = [];
        if (template && template.parameters) {
            templateParameters = Object.keys(template.parameters);
        }
        const templateFormGroup = {};
        for (let key of templateParameters) {
            let defaultValue = null;
            let validator = Validators.required;
            if (exists(template.parameters[key].defaultValue)) {
                defaultValue = String(template.parameters[key].defaultValue);
                if (template.parameters[key].defaultValue === "") {
                    validator = null;
                }
            }
            templateFormGroup[key] = new FormControl(defaultValue, validator);
        }
        return new FormGroup(templateFormGroup);
    }

    private _createForms() {
        this.jobParams = this._getFormGroup(this.jobTemplate);
        this.poolParams = this._getFormGroup(this.poolTemplate);
        this.form = this.formBuilder.group({ pool: this.poolParams, job: this.jobParams, poolpicker: this.pickedPool });
    }

    private _runJobWithPool(expandedPoolTemplate) {
        delete expandedPoolTemplate.id;
        this.jobTemplate.job.properties.poolInfo = {
            autoPoolSpecification: {
                autoPoolIdPrefix: "autopool",
                poolLifetimeOption: "job",
                keepAlive: false,
                pool: expandedPoolTemplate,
            },
        };
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
