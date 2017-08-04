import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm } from "app/core";
import { Pool } from "app/models";
import { NodeFillType } from "app/models";
import { PoolCreateDto } from "app/models/dtos";
import { CreatePoolModel, PoolOsSources, createPoolToData, poolToFormModel } from "app/models/forms";
import { PoolService, PricingService, VmSizeService } from "app/services";
import { Constants, NumberUtils } from "app/utils";

@Component({
    selector: "bl-pool-create-basic-dialog",
    templateUrl: "pool-create-basic-dialog.html",
})
export class PoolCreateBasicDialogComponent extends DynamicForm<Pool, PoolCreateDto> implements OnDestroy {
    public osSource: PoolOsSources = PoolOsSources.IaaS;
    public osType: "linux" | "windows" = "linux";
    public NodeFillType = NodeFillType;

    public estimatedCost: string = "-";

    private _osControl: FormControl;
    private _licenseControl: FormControl;
    private _renderingSkuSelected: boolean = false;
    private _sub: Subscription;

    private _lastFormValue: CreatePoolModel;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<PoolCreateBasicDialogComponent>,
        private poolService: PoolService,
        vmSizeService: VmSizeService,
        private pricingService: PricingService,
        private notificationService: NotificationService) {
        super(PoolCreateDto);

        this._osControl = this.formBuilder.control({}, Validators.required);
        this._licenseControl = this.formBuilder.control([]);

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
            maxTasksPerNode: 1,
            enableInterNodeCommunication: false,
            taskSchedulingPolicy: [NodeFillType.pack],
            startTask: null,
            userAccounts: [[]],
            appLicenses: [[]],
        });

        this._sub = this._osControl.valueChanges.subscribe((value) => {
            this.osSource = value.source;
            if (value.source === PoolOsSources.PaaS) {
                this._renderingSkuSelected = false;
                this.osType = "windows";
            } else {
                const config = value.virtualMachineConfiguration;
                const agentId: string = config && config.nodeAgentSKUId;
                this._renderingSkuSelected = config && config.imageReference
                    && config.imageReference.publisher === "batch";

                if (agentId && agentId.toLowerCase().indexOf("windows") !== -1) {
                    this.osType = "windows";
                } else {
                    this.osType = "linux";
                }
            }
        });

        this.form.valueChanges.subscribe((value) => {
            if (!this._lastFormValue
                || value.vmSize !== this._lastFormValue.vmSize
                || this._lastFormValue.scale !== value.scale) {
                this._updateEstimatedPrice();
            }
            this._lastFormValue = value;
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @autobind()
    public submit(): Observable<any> {
        const id = this.form.value.id;
        const data = this.getCurrentValue();
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

    public get startTask() {
        return this.form.controls.startTask.value;
    }

    public get renderingSkuSelected(): boolean {
        return this._renderingSkuSelected;
    }

    private _updateEstimatedPrice() {
        const value: CreatePoolModel = this.form.value;

        console.log("Value", value);
        console.log("Value", !value.vmSize, !this.osType);
        if (!value.vmSize || !this.osType) {
            return;
        }
        // const scale = this.form.value.scale || {};
        // const imaginaryPool = new Pool({
        //     currentDedicatedNodes: scale.targetDedicatedNodes,
        //     currentLowPriorityNodes: scale.targetLowPriorityNodes,
        //     virtualMachineConfiguration: value.os.virtualMachineConfiguration,
        //     cloudServiceConfiguration: value.os.cloudServiceConfiguration,
        // } as any);
        const imaginaryPool = createPoolToData(this.form.value);
        return this.pricingService.computePoolPrice(imaginaryPool as any, { target: true }).subscribe((cost) => {
            console.log("Returned price", cost);
            if (cost) {
                this.estimatedCost = `${cost.unit} ${NumberUtils.pretty(cost.total)}`;
            } else {
                this.estimatedCost = "-";
            }
        });
    }

    // private _calculateEstimatedPrice() {
    //     const cost = this._pickedSpecCost;
    //     const totalNodes = this._nodesMultiplier;
    //     if (!cost || totalNodes === null) {
    //         this.estimatedCost = `-`;
    //         return;
    //     }

    //     const amount = cost.amount * totalNodes;
    //     this.estimatedCost = `${cost.currencyCode} ${NumberUtils.pretty(amount)}`;
    // }

    private get _nodesMultiplier(): number {
        const scale = this.form.value.scale;
        if (!scale) {
            return 0;
        }

        if (scale.enableAutoScale) {
            return null;
        }

        let lowPriMultipler: number;
        if (this.osType === "linux") { // Linux gets 80% discount for low pri, windows gets 60%
            lowPriMultipler = 0.2;
        } else {
            lowPriMultipler = 0.4;
        }
        return scale.targetDedicatedNodes + scale.targetLowPriorityNodes * lowPriMultipler;
    }
}
