import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { ComplexFormConfig } from "app/components/base/form";
import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm } from "app/core";
import { NodeFillType, Pool } from "app/models";
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
    public hasLinkedStorage: boolean = true;
    public estimatedCost: string = "-";
    public complexFormConfig: ComplexFormConfig;
    public fileUri = "create.pool.batch.json";
    private _osControl: FormControl;
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
        this._setComplexFormConfig();

        this.hasLinkedStorage = true;
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
            maxTasksPerNode: 1,
            enableInterNodeCommunication: false,
            taskSchedulingPolicy: [NodeFillType.pack],
            startTask: null,
            userAccounts: [[]],
            appLicenses: [[]],
            appPackages: [[]],
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
                || value.os !== this._lastFormValue.os
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

    public handleHasLinkedStorage(hasLinkedStorage) {
        this.hasLinkedStorage = hasLinkedStorage;
    }

    public get startTask() {
        return this.form.controls.startTask.value;
    }

    public get renderingSkuSelected(): boolean {
        return this._renderingSkuSelected;
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
}
