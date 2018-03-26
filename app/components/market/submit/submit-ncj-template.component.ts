import { Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { ServerError, autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarManager } from "@batch-flask/ui/sidebar";

import { FileGroupCreateFormComponent } from "app/components/data/action";
import { NcjJobTemplate, NcjParameter, NcjPoolTemplate, NcjTemplateMode } from "app/models";
import { FileGroupCreateDto, FileOrDirectoryDto } from "app/models/dtos";
import { NcjSubmitService, NcjTemplateService, StorageService } from "app/services";
import { exists, log } from "app/utils";
import { Constants } from "common";
import { NcjParameterExtendedType, NcjParameterWrapper } from "./market-application.model";

import "./submit-ncj-template.scss";

@Component({
    selector: "bl-submit-ncj-template",
    templateUrl: "submit-ncj-template.html",
})
export class SubmitNcjTemplateComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public jobTemplate: NcjJobTemplate;
    @Input() public poolTemplate: NcjPoolTemplate;
    @Input() public title: string;

    /**
     * initial data
     */
    @Input() public initialJobParams: StringMap<any>;
    @Input() public initialPoolParams: StringMap<any>;
    @Input() public initialPickedPool: string;
    @Input() public initialModeState: NcjTemplateMode;

    public NcjTemplateMode = NcjTemplateMode;
    public modeState = NcjTemplateMode.None;
    public form: FormGroup;
    public multipleModes = false;

    public pickedPool = new FormControl(null, Validators.required);
    public jobParams: FormGroup;
    public poolParams: FormGroup;
    public jobParametersWrapper: NcjParameterWrapper[];
    public poolParametersWrapper: NcjParameterWrapper[];
    public error: ServerError;

    private _routeParametersSub: Subscription;
    private _controlChanges: Subscription[] = [];
    private _parameterTypeMap = {};
    private _queryParameters: {};
    private _loaded = false;
    private _blockRedirection = false;

    constructor(
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private notificationService: NotificationService,
        private router: Router,
        private templateService: NcjTemplateService,
        private ncjSubmitService: NcjSubmitService,
        private sidebarManager: SidebarManager,
        private storageService: StorageService) {

        this.form = new FormGroup({});
    }

    public ngOnInit() {
        const autoPoolParam = Constants.KnownQueryParameters.useAutoPool;
        this._routeParametersSub = this.activatedRoute.queryParams.subscribe((params: any) => {
            this._queryParameters = Object.assign({}, params);
            if (this._queryParameters[autoPoolParam]) {
                const modeAutoSelect = Boolean(parseInt(this._queryParameters[autoPoolParam], 10))
                    ? NcjTemplateMode.NewPoolAndJob
                    : NcjTemplateMode.ExistingPoolAndJob;

                this.pickMode(modeAutoSelect);
            }

            if (!this._loaded) {
                // subscribe is fired every time a value changes now so don't want to re-apply
                this._checkForAssetsToSync();
                this._applyinitialData();
                this._loaded = true;
            }
        });
    }

    public ngOnChanges(changes) {
        this.multipleModes = Boolean(this.jobTemplate && this.poolTemplate);
        if (changes.jobTemplate || changes.poolTemplate) {
            if (!this.multipleModes) {
                this.modeState = this.poolTemplate ? NcjTemplateMode.NewPool : NcjTemplateMode.ExistingPoolAndJob;
            }

            if (!this._loaded) {
                this._queryParameters = {};
                this._parameterTypeMap = {};
                this._processParameters();
                this._createForms();
            }
        }
    }

    public ngOnDestroy() {
        this._routeParametersSub.unsubscribe();
        this._controlChanges.forEach(x => x.unsubscribe());
    }

    public get showPoolForm(): boolean {
        return this.modeState === NcjTemplateMode.NewPoolAndJob || this.modeState === NcjTemplateMode.NewPool;
    }

    public get showPoolPicker(): boolean {
        return this.modeState === NcjTemplateMode.ExistingPoolAndJob;
    }

    public get showJobForm(): boolean {
        return this.modeState === NcjTemplateMode.NewPoolAndJob
            || this.modeState === NcjTemplateMode.ExistingPoolAndJob;
    }

    public pickMode(mode: NcjTemplateMode) {
        this.modeState = mode;
    }

    public get submitToolTip(): string {
        if (this.isFormValid()) {
            return "Click to submit form";
        }

        return "Form is not valid";
    }

    public isFormValid() {
        return (this.modeState === NcjTemplateMode.NewPoolAndJob && this.jobParams.valid && this.poolParams.valid) ||
            (this.modeState === NcjTemplateMode.ExistingPoolAndJob && this.jobParams.valid && this.pickedPool.valid) ||
            (this.modeState === NcjTemplateMode.NewPool && this.poolParams.valid);
    }

    public trackParameter(index, param: NcjParameterWrapper) {
        return param.id;
    }

    public blockRedirectionCheckChanged(event: MatCheckboxChange) {
        this._blockRedirection = event.checked;
    }

    @autobind()
    public submit() {
        this.error = null;
        let method;
        const methods = {
            [NcjTemplateMode.NewPoolAndJob]: this._createJobWithAutoPool,
            [NcjTemplateMode.ExistingPoolAndJob]: this._createJob,
            [NcjTemplateMode.NewPool]: this._createPool,
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
        this._saveTemplateAsRecent();
        return this.ncjSubmitService.expandPoolTemplate(this.poolTemplate, this.poolParams.value)
            .cascade(data => this._runJobWithPool(data));
    }

    @autobind()
    private _createJob() {
        const jobTemplate = { ...this.jobTemplate };
        jobTemplate.job.properties.poolInfo = this.pickedPool.value;
        this._saveTemplateAsRecent();
        return this.ncjSubmitService.submitJob(jobTemplate, this.jobParams.value)
            .cascade((data) => this._redirectToJob(data.properties.id));
    }

    @autobind()
    private _createPool() {
        this._saveTemplateAsRecent();
        return this.ncjSubmitService.createPool(this.poolTemplate, this.poolParams.value)
            .cascade((data) => this._redirectToPool(data.id));
    }

    private _checkForAssetsToSync() {
        const assets = this._queryParameters[Constants.KnownQueryParameters.assetPaths];
        const container = this._queryParameters[Constants.KnownQueryParameters.assetContainer];
        if (assets && container) {
            // we only want to do this if we have a container name and asset list
            // TODO: think about this, we may want to even if there is no container and
            //       just leave the user to enter one.
            this._syncFileGroup(container, assets.split(","));
        }
    }

    private _syncFileGroup(container: string, paths: string[]) {
        const sidebarRef = this.sidebarManager.open("sync-file-group", FileGroupCreateFormComponent);

        sidebarRef.component.setValue(new FileGroupCreateDto({
            name: this.storageService.removeFileGroupPrefix(container),
            paths: paths.map((path) => new FileOrDirectoryDto({ path: path })),
            includeSubDirectories: true,
        }));

        sidebarRef.afterCompletion.subscribe(() => {
            this.storageService.onContainerUpdated.next();
            const fileGroupName = sidebarRef.component.getCurrentValue().name;

            if (fileGroupName && this._queryParameters[Constants.KnownQueryParameters.inputParameter]) {
                // we know what the control is called so update it with the new value
                const parameterName = this._queryParameters[Constants.KnownQueryParameters.inputParameter];
                const fileGroupContainer = this.storageService.addFileGroupPrefix(fileGroupName);
                (this.form.controls.job as FormGroup).controls[parameterName].setValue(fileGroupContainer);
            }
        });
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
        for (const name of Object.keys(parameters)) {
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
        for (const key of templateParameters) {
            let defaultValue = null;
            let validator = Validators.required;
            if (exists(template.parameters[key].defaultValue)) {
                defaultValue = String(template.parameters[key].defaultValue);
                if (template.parameters[key].defaultValue === "") {
                    validator = null;
                }
            }

            templateFormGroup[key] = new FormControl(defaultValue, validator);
            if (template.parameters[key].metadata.advancedType) {
                // Store the advanced data type as we need it for change events from file-groups
                this._parameterTypeMap[key] = template.parameters[key].metadata.advancedType;
            }

            // Wire up a control change event handler
            this._handleControlChangeEvents(templateFormGroup, key);
        }

        return new FormGroup(templateFormGroup);
    }

    private _handleControlChangeEvents(formGroup, key) {
        // Listen to control value change events and update the route parameters to match
        // tslint:disable-next-line:max-line-length
        this._controlChanges.push(formGroup[key].valueChanges.debounceTime(400).distinctUntilChanged().subscribe((change) => {
            if (this._parameterTypeMap[key] === NcjParameterExtendedType.fileGroup && Boolean(change)) {
                // Quick-Fix until we modify the CLI to finally sort out file group prefixes
                change = this.storageService.addFileGroupPrefix(change);
            }

            // Set the parameters on the route so when page reloads we keep the existing parameters
            this._queryParameters[key] = change;
            const urlTree = this.router.createUrlTree([], {
                queryParams: this._queryParameters,
                queryParamsHandling: "merge",
                preserveFragment: true,
            });

            this.router.navigateByUrl(urlTree);
        }));
    }

    private _createForms() {
        this.jobParams = this._getFormGroup(this.jobTemplate);
        this.poolParams = this._getFormGroup(this.poolTemplate);
        this.form = this.formBuilder.group({ pool: this.poolParams, job: this.jobParams, poolpicker: this.pickedPool });
    }

    private _runJobWithPool(expandedPoolTemplate) {
        const pool = exists(expandedPoolTemplate.properties) ? expandedPoolTemplate.properties : expandedPoolTemplate;
        delete pool.id;
        const jobTemplate = { ...this.jobTemplate };
        jobTemplate.job.properties.poolInfo = {
            autoPoolSpecification: {
                autoPoolIdPrefix: "autopool",
                poolLifetimeOption: "job",
                keepAlive: false,
                pool: pool,
            },
        };
        return this.ncjSubmitService.submitJob(jobTemplate, this.jobParams.value)
            .cascade((data) => this._redirectToJob(data.properties.id));
    }

    private _saveTemplateAsRecent() {
        this.templateService.addRecentSubmission({
            name: this.title,
            jobTemplate: this.jobTemplate,
            poolTemplate: this.poolTemplate,
            mode: this.modeState,
            jobParams: this.jobParams.value,
            poolParams: this.poolParams.value,
            pickedPool: this.pickedPool.value,
        });
    }

    private _applyinitialData() {
        if (this._queryParameters || this.initialJobParams) {
            this.jobParams.patchValue({ ... this._queryParameters, ... this.initialJobParams });
        }
        if (this._queryParameters || this.initialPoolParams) {
            this.poolParams.patchValue({ ... this._queryParameters, ... this.initialPoolParams });
        }

        if (this.initialPickedPool) {
            this.pickedPool.setValue(this.initialPickedPool);
        }

        if (this.initialModeState) {
            this.modeState = this.initialModeState;
        }
    }

    private _redirectToJob(id) {
        if (!this._blockRedirection) {
            if (id) {
                this.router.navigate(["/jobs", id]);
            } else {
                this.router.navigate(["/jobs"]);
            }
        } else {
            this._notifySuccess("Create Job", id);
        }
    }

    private _redirectToPool(id) {
        if (!this._blockRedirection) {
            if (id) {
                this.router.navigate(["/pools", id]);
            } else {
                this.router.navigate(["/pools"]);
            }
        } else {
            this._notifySuccess("Create Pool", id);
        }
    }

    private _notifySuccess(type, id) {
        // If we don't want to redirect, I still want to know that the job/pool was submitted.
        const message = `${type} with ID: '${id}' was successfully submitted to the service.`;
        this.notificationService.success(type, message);
    }
}
