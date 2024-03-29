import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, ValidationErrors, Validators } from "@angular/forms";
import { DynamicForm, autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { ComplexFormConfig } from "@batch-flask/ui/form";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { NodeFillType, Pool } from "app/models";
import { PoolCreateDto } from "app/models/dtos";
import { CreatePoolModel, PoolOsSources, createPoolToData, poolToFormModel } from "app/models/forms";
import { BatchAccountService, PoolService, PricingService, VmSizeService } from "app/services";
import { NumberUtils } from "app/utils";
import { Constants } from "common";
import { Observable, Subscription, of } from "rxjs";
import { map } from "rxjs/operators";
import { PoolUtils } from "app/utils";

import "./pool-create-basic-dialog.scss";

export enum ImageEOLState {
    None,
    PassedEndOfLife,
    NearingEndOfLife,
    FarAwayFromEndOfLife,
}

@Component({
    selector: "bl-pool-create-basic-dialog",
    templateUrl: "pool-create-basic-dialog.html",
})
export class PoolCreateBasicDialogComponent extends DynamicForm<Pool, PoolCreateDto> implements OnDestroy {

    public get startTask() {
        return this.form.controls.startTask.value;
    }

    public get renderingSkuSelected(): boolean {
        return this._renderingSkuSelected;
    }

    public get virtualMachineConfiguration() {
        return this._osControl.value && this._osControl.value.virtualMachineConfiguration;
    }

    public get cloudServiceConfiguration() {
        return this._osControl.value && this._osControl.value.cloudServiceConfiguration;
    }

    public get selectedDeprecatedImageEndOfLife() {
        return this.virtualMachineConfiguration && this.virtualMachineConfiguration.batchSupportEndOfLife;
    }

    public get selectedImageWillDeprecate() {
        return this.endOfLifeProximity != ImageEOLState.PassedEndOfLife && this.endOfLifeProximity != ImageEOLState.None;
    }

    public get hasDeprecationLink() {
        return this.selectedImageWillDeprecate && PoolUtils.getEndOfLifeHyperlinkforPoolCreate(this.selectedVirtualMachineImageName);
    }

    public get selectedVirtualMachineImageName(): string {
        return this._osControl.value.virtualMachineConfiguration.imageReference.sku;
    }

    public get selectedVirtualMachineImageEndOfLifeDate(): string {
        return this.selectedDeprecatedImageEndOfLife.toDateString();
    }

    public osSource: PoolOsSources = PoolOsSources.IaaS;
    public osType: "linux" | "windows" = "linux";
    public NodeFillType = NodeFillType;
    public hasLinkedStorage: boolean = false;
    public estimatedCost: string = "-";
    public complexFormConfig: ComplexFormConfig;
    public fileUri = "create.pool.batch.json";
    public armNetworkOnly = true;
    public title = "Add pool";

    public imageEOLState = ImageEOLState;
    public endOfLifeProximity: ImageEOLState = ImageEOLState.None;

    private _osControl: FormControl;
    private _renderingSkuSelected: boolean = false;
    private _subs: Subscription[] = [];
    private _lastFormValue: CreatePoolModel;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<PoolCreateBasicDialogComponent>,
        private poolService: PoolService,
        private accountService: BatchAccountService,
        private pricingService: PricingService,
        private vmSizeService: VmSizeService,
        changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
        private electronShell: ElectronShell) {

        super(PoolCreateDto);
        this._setComplexFormConfig();

        this._subs.push(this.accountService.currentAccount.subscribe((account) => {
            this.hasLinkedStorage = account.hasArmAutoStorage();
            changeDetector.markForCheck();
        }));
        this._osControl = this.formBuilder.control({}, Validators.required);

        this.form = formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(64),
                Validators.pattern(Constants.forms.validation.regex.id),
            ]],
            displayName: "",
            scale: [null],
            os: this._osControl,
            // note: probably not advisable to default vmSize value
            vmSize: ["", Validators.required],
            taskSlotsPerNode: [1, Validators.min(1)],
            enableInterNodeCommunication: false,
            taskSchedulingPolicy: [NodeFillType.pack],
            startTask: null,
            userAccounts: [[]],
            appLicenses: [[]],
            appPackages: [[]],
            inboundNATPools: [[]],
            subnetId: [null],
            certificateReferences: [[]],
            metadata: [null],
        });

        this.form.controls["vmSize"].valueChanges.subscribe({
            next: (value) => {
                this.form.controls["taskSlotsPerNode"].updateValueAndValidity();
            },
        });

        this.form.controls["taskSlotsPerNode"].setAsyncValidators([this.slotValidator()]);

        this._subs.push(this._osControl.valueChanges.subscribe((value) => {
            this.osSource = value.source;
            if (value.source === PoolOsSources.PaaS) {
                this._renderingSkuSelected = false;
                this.osType = "windows";
            } else {
                const config = value.virtualMachineConfiguration;
                const agentId: string = config && config.nodeAgentSKUId;
                this._renderingSkuSelected = this._canShowLicensePicker(config);
                if (agentId && agentId.toLowerCase().indexOf("windows") !== -1) {
                    this.osType = "windows";
                } else {
                    this.osType = "linux";
                }
            }

            if (!value.virtualMachineConfiguration) {
                this.form.patchValue({
                    inboundNATPools: [],
                });
            }

            // For pools created with virtualMachineConfiguration only ARM virtual
            // networks ('Microsoft.Network/virtualNetworks') are supported,
            // but for pools created with cloudServiceConfiguration both ARM and
            // classic virtual networks are supported.
            if (value.virtualMachineConfiguration) {
                this.armNetworkOnly = true;
            }
            if (value.cloudServiceConfiguration) {
                this.armNetworkOnly = false;
            }
        }));

        this.form.valueChanges.subscribe((value) => {
            if (!this._lastFormValue
                || value.os !== this._lastFormValue.os
                || value.appLicenses !== this._lastFormValue.appLicenses
                || value.vmSize !== this._lastFormValue.vmSize
                || this._lastFormValue.scale !== value.scale) {
                this._updateEstimatedPrice();
                this._updateImageEOLState();
            }
            this._lastFormValue = value;
        });
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    @autobind()
    public submit(data: PoolCreateDto): Observable<any> {
        const id = data.id;
        const obs = this.poolService.add(data);
        obs.subscribe({
            next: () => {
                this.poolService.onPoolAdded.next(id);
                this.notificationService.success("Pool added!", `Pool '${id}' was created successfully!`);
            },
            error: () => null,
        });

        return obs;
    }

    public dtoToForm(pool: PoolCreateDto) {
        return poolToFormModel(pool);
    }

    public formToDto(data: any): PoolCreateDto {
        return createPoolToData(data);
    }

    private slotValidator(): AsyncValidatorFn {
        return (formControl: AbstractControl): Observable<ValidationErrors> => {
            const valueInput = this.form.controls["taskSlotsPerNode"].value;
            if (this.form.controls["vmSize"].value === "") {
                return of(valueInput > 256 ? { max: 256 } : null);
            }
            return this.vmSizeService.get(this.form.controls["vmSize"].value).pipe(
                map(res => {
                    const maxCores = Math.min(res.numberOfCores * 4, 256);
                    return valueInput > maxCores ? { max: maxCores } : null;
                }),
            );
        };
    }

    private _canShowLicensePicker(config: any): boolean {
        if (!config || !config.imageReference) { return false; }
        return config.imageReference.publisher === "batch"
            || Boolean(config.imageReference.virtualMachineImageId);
    }

    private _updateEstimatedPrice() {
        const value: CreatePoolModel = this.form.value;

        if (!value.vmSize || !this.osType) {
            return;
        }
        const imaginaryPool = new Pool(createPoolToData(this.form.value).toJS() as any);
        return this.pricingService.computePoolPrice(imaginaryPool as any, { target: true }).subscribe((cost) => {
            if (cost) {
                this.estimatedCost = `${cost.unit} ${NumberUtils.pretty(cost.total)}`;
            } else {
                this.estimatedCost = "-";
            }
        });
    }

    private _setComplexFormConfig() {
        this.complexFormConfig = {
            jsonEditor: {
                dtoType: PoolCreateDto,
                toDto: (value) => this.formToDto(value),
                fromDto: (value) => this.dtoToForm(value),
            },
        };
    }

    public openDeprecationLink() {
        const link = PoolUtils.getEndOfLifeHyperlinkforPoolCreate(this.selectedVirtualMachineImageName);
        this.electronShell.openExternal(link, {activate: true});
    }

    public openLink(link: string) {
        this.electronShell.openExternal(link, {activate: true});
    }

    private _updateImageEOLState() {
        if (!this.selectedDeprecatedImageEndOfLife) {
            this.endOfLifeProximity = ImageEOLState.None;
            return;
        }
        const diff = this.selectedDeprecatedImageEndOfLife.getTime() - Date.now();
        const days = diff / (1000 * 3600 * 24);
        if (days >= 0 && days <= 365) {
            this.endOfLifeProximity = ImageEOLState.NearingEndOfLife;
        } else if (days > 365) {
            this.endOfLifeProximity = ImageEOLState.FarAwayFromEndOfLife;
        } else {
            this.endOfLifeProximity = ImageEOLState.PassedEndOfLife;
        }
    }
}
