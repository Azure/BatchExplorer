import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TelemetryService, UserConfigurationService, autobind } from "@batch-flask/core";
import { EventTelemetry } from "@batch-flask/core/telemetry";
import { DialogService } from "@batch-flask/ui";
import { NotificationService } from "@batch-flask/ui/notifications";
import { exists, log } from "@batch-flask/utils";
import { FileGroupCreateFormComponent } from "app/components/data/action";
import { NcjJobTemplate, NcjParameter, NcjPoolTemplate, NcjTemplateMode } from "app/models";
import { FileGroupCreateDto, FileOrDirectoryDto } from "app/models/dtos";
import { NcjFileGroupService, NcjSubmitService, NcjTemplateService } from "app/services";
import { StorageContainerService } from "app/services/storage";
import { BEUserDesktopConfiguration, Constants } from "common";
import { Observable, Subject, Subscription, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from "rxjs/operators";
import { NcjParameterExtendedType, NcjParameterWrapper } from "./market-application.model";

import "./submit-ncj-template.scss";

@Component({
    selector: "bl-submit-ncj-template",
    templateUrl: "submit-ncj-template.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmitNcjTemplateComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public jobTemplate: NcjJobTemplate;
    @Input() public poolTemplate: NcjPoolTemplate;
    @Input() public title: string;
    @Input() public autoRedirect = true;
    @Input() public notify = false;
    @Input() public containerRef: any;

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
    public poolContainerImage: string;

    private _destroy = new Subject();
    private _controlChanges: Subscription[] = [];
    private _parameterTypeMap = {};
    private _queryParameters: {};
    private _loaded = false;
    private _defaultOutputDataContainer: string | undefined | null = null;

    public get actionName() {
        if (this.modeState === NcjTemplateMode.NewPool) {
            return "Create";
        } else {
            return "Run";
        }
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private notificationService: NotificationService,
        private router: Router,
        private templateService: NcjTemplateService,
        private ncjSubmitService: NcjSubmitService,
        private dialogService: DialogService,
        private fileGroupService: NcjFileGroupService,
        private storageService: StorageContainerService,
        private settingsService: UserConfigurationService<BEUserDesktopConfiguration>,
        private telemetryService: TelemetryService) {

        this.form = new FormGroup({});

        this.settingsService.watch("jobTemplate").pipe(takeUntil(this._destroy)).subscribe((jobTemplate) => {
            this._defaultOutputDataContainer = jobTemplate.defaultOutputFileGroup;
        });
    }

    public ngOnInit() {
        this.activatedRoute.queryParams.pipe(takeUntil(this._destroy)).subscribe((params: any) => {
            this._queryParameters = Object.assign({}, params);
            if (!this._loaded) {
                // subscribe is fired every time a value changes now so don't want to re-apply
                this._checkForAutoPoolParam();
                this._checkForOutputContainerParam();
                this._checkForAssetsToSync();
                this._applyinitialData();
                this._loaded = true;
            }
        });
    }

    public ngOnChanges(changes) {
        this.multipleModes = Boolean(this.jobTemplate && this.poolTemplate);
        if (changes.jobTemplate || changes.poolTemplate) {
            if (!this._loaded) {
                this._queryParameters = {};
                this._parameterTypeMap = {};
                this._processParameters();
                this._createForms();
            }
            if (!this.multipleModes) {
                this.pickMode(this.poolTemplate ? NcjTemplateMode.NewPool : NcjTemplateMode.ExistingPoolAndJob);
            }
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._controlChanges.forEach(x => x.unsubscribe());
    }

    public get showPoolForm(): boolean {
        return this.modeState === NcjTemplateMode.NewPoolAndJob || this.modeState === NcjTemplateMode.NewPool;
    }

    public get showPoolPicker(): boolean {
        return this.modeState === NcjTemplateMode.ExistingPoolAndJob && !this.jobTemplateIsAutoPool;
    }

    public get showJobForm(): boolean {
        return this.modeState === NcjTemplateMode.NewPoolAndJob
            || this.modeState === NcjTemplateMode.ExistingPoolAndJob;
    }

    public get jobTemplateIsAutoPool() {
        return Boolean(this.jobTemplate.job.properties.poolInfo
            && this.jobTemplate.job.properties.poolInfo.autoPoolSpecification);
    }

    public get jobTemplateNeedsContainerImage(): boolean {
        if (!this.jobTemplate.parameters.containerImage ||
            !this.jobTemplate.parameters.containerImage.additionalProperties) {
            return false;
        }

        return Boolean(this.jobTemplate.parameters.containerImage.additionalProperties.app
        && this.jobTemplate.parameters.containerImage.additionalProperties.renderEngine
        && this.jobTemplate.parameters.containerImage.additionalProperties.imageReferenceId);
    }

    public pickMode(mode: NcjTemplateMode) {
        this.modeState = mode;

        this.form = this.formBuilder.group({
            pool: this.showPoolForm ? this.poolParams : undefined,
            job: this.showJobForm ? this.jobParams : undefined,
            poolpicker: this.showPoolPicker ? this.pickedPool : undefined,
        });
        this.changeDetector.markForCheck();
    }

    public trackParameter(_, param: NcjParameterWrapper) {
        return param.id;
    }

    @autobind()
    public submit() {
        const methods: { [key in  NcjTemplateMode]?: () => Observable<any> } = {
            [NcjTemplateMode.NewPoolAndJob]:  this._createJobWithAutoPool,
            [NcjTemplateMode.ExistingPoolAndJob]:  this._createJob,
            [NcjTemplateMode.NewPool]:  this._createPool,
        };
        const method: () => Observable<any> = methods[this.modeState];

        if (method) {
            const obs = method();
            obs.subscribe();

            this.gallerySubmitTelemetry(this.modeState);

            return obs;
        } else {
            log.error("Couldn't find how to submit this template.", { modeState: this.modeState });
            return of(null);
        }
    }

    private gallerySubmitTelemetry(mode: NcjTemplateMode) {
        const telemetry: EventTelemetry = {
            name: "Execute action",
            properties: {
                name: "submit",
                type:  "Gallery",
                templateMode: NcjTemplateMode[mode],
            },
        };
        this.telemetryService.trackEvent(telemetry);
    }

    @autobind()
    private _createJobWithAutoPool(): Observable<any> {
        this._saveTemplateAsRecent();
        return this.ncjSubmitService.expandPoolTemplate(this.poolTemplate, this.poolParams.value).pipe(
            switchMap(data => this._runJobWithPool(data)),
        );
    }

    @autobind()
    private _createJob(): Observable<any> {
        const jobTemplate = { ...this.jobTemplate };
        if (!this.jobTemplateIsAutoPool) {
            jobTemplate.job.properties.poolInfo = this.pickedPool.value;
        }
        this._saveTemplateAsRecent();
        const obs = this.ncjSubmitService.submitJob(jobTemplate, this.jobParams.value);
        obs.subscribe((data) => this._onJobCreated(data.properties.id));
        return obs;
    }

    @autobind()
    private _createPool(): Observable<any> {
        this._saveTemplateAsRecent();
        const obs = this.ncjSubmitService.createPool(this.poolTemplate, this.poolParams.value);
        obs.subscribe((data) => {
            if (this.jobTemplate) {
                // Dave wants it to never redirect to pool in this context when we also have a job template.
                const message = `Create Pool with ID: '${data.id}' was successfully submitted to the service.`;
                this.notificationService.success("Create Pool", message, { autoDismiss: 5000 });
                this.pickMode(NcjTemplateMode.ExistingPoolAndJob);
                this.pickedPool.setValue({ poolId: data.id });
            } else {
                this._onPoolCreated(data.id);
            }
        });

        return obs;
    }

    private _checkForAutoPoolParam() {
        const autoPoolParam = Constants.KnownQueryParameters.useAutoPool;
        if (this._queryParameters[autoPoolParam]) {
            const modeAutoSelect = Boolean(parseInt(this._queryParameters[autoPoolParam], 10))
                ? NcjTemplateMode.NewPoolAndJob
                : NcjTemplateMode.ExistingPoolAndJob;

            this.pickMode(modeAutoSelect);
        }
    }

    private _checkForOutputContainerParam() {
        const outputParamKey = Constants.KnownQueryParameters.outputs;
        const outputContainer = this._queryParameters[outputParamKey];
        if (!outputContainer && this._defaultOutputDataContainer) {
            // output file-group parameter was not passed in, but we have one in the default user
            // settings, so add it to the query parameters.
            this._queryParameters[outputParamKey] = this._defaultOutputDataContainer;
        }
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
        const sidebarRef = this.dialogService.open(FileGroupCreateFormComponent);

        sidebarRef.componentInstance.setValue(new FileGroupCreateDto({
            name: this.fileGroupService.removeFileGroupPrefix(container),
            paths: paths.map((path) => new FileOrDirectoryDto({ path: path })),
            includeSubDirectories: true,
        }));

        sidebarRef.afterClosed().subscribe(() => {
            this.storageService.onContainerUpdated.next();
            const fileGroupName = sidebarRef.componentInstance.getCurrentValue().name;

            if (fileGroupName && this._queryParameters[Constants.KnownQueryParameters.inputParameter]) {
                // we know what the control is called so update it with the new value
                const parameterName = this._queryParameters[Constants.KnownQueryParameters.inputParameter];
                const fileGroupContainer = this.fileGroupService.addFileGroupPrefix(fileGroupName);
                const control = (this.form.controls.job as FormGroup).controls[parameterName];
                if (control) {
                    control.setValue(fileGroupContainer);
                }
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
            if (!this.jobTemplateIsAutoPool && this.jobTemplate.parameters.poolId) {
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
                if (defaultValue.trim() === "") {
                    validator = null;
                }
            }

            templateFormGroup[key] = new FormControl(defaultValue, validator);
            if (template.parameters[key].metadata && template.parameters[key].metadata.advancedType) {
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
        // eslint-disable-next-line max-len
        this._controlChanges.push(formGroup[key].valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe((change) => {
            if (this._parameterTypeMap[key] === NcjParameterExtendedType.fileGroup && Boolean(change)) {
                // Quick-Fix until we modify the CLI to finally sort out file group prefixes
                change = this.fileGroupService.addFileGroupPrefix(change);
            }

            if (this._parameterTypeMap[key] === NcjParameterExtendedType.renderingContainerImage && Boolean(change)) {
                this.poolContainerImage = change;
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
        this.changeDetector.markForCheck();
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
        const obs = this.ncjSubmitService.submitJob(jobTemplate, this.jobParams.value);
        obs.subscribe((data) => this._onJobCreated(data.properties.id));

        return obs;
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
            this.pickMode(this.initialModeState);
        }
    }

    private _onJobCreated(id) {
        const url = ["/jobs"];
        if (id) {
            url.push(id);
        }
        if (this.autoRedirect) {
            this.router.navigate(url);
        }

        if (this.notify) {
            this.notificationService.success("Job created", `Job ${id} was successfully created`, {
                action: () => this.router.navigate(url),
            });
        }

        if (this.containerRef) {
            this.containerRef.close();
        }
    }

    private _onPoolCreated(id) {
        const url = ["/pools"];
        if (id) {
            url.push(id);
        }
        if (this.autoRedirect) {
            this.router.navigate(url);
        }

        if (this.notify) {
            this.notificationService.success("Pool created", `Pool ${id} was successfully created`, {
                action: () => this.router.navigate(url),
            });
        }

        if (this.containerRef) {
            this.containerRef.close();
        }
    }
}
