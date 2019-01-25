import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { NodeAgentSku, Offer, PoolOsSkus, Resource, Sku } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { PoolOsService } from "app/services";
import { Subject } from "rxjs";
import { CustomImageSelection } from "./custom-image-picker";

import { takeUntil } from "rxjs/operators";
import "./pool-os-picker.scss";

const cloudServiceOsFamilies = [{
    id: "2",
    name: "2008 R2 SP1",
}, {
    id: "3",
    name: "2012",
}, {
    id: "4",
    name: "2012 R2",
}, {
    id: "5",
    name: "2016",
}].reverse(); // Reverse so we have most recent first

@Component({
    selector: "bl-pool-os-picker",
    templateUrl: "pool-os-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolOsPickerComponent implements ControlValueAccessor, OnDestroy {

    public get vmOffers() {
        return this._nodeAgentSkuMap.vmOffers;
    }

    public get dataScienceOffers() {
        return this._nodeAgentSkuMap.dataScienceOffers;
    }

    public get renderingOffers() {
        return this._nodeAgentSkuMap.renderingOffers;
    }

    public get dockerOffers() {
        return this._nodeAgentSkuMap.dockerOffers;
    }

    public get customImage(): CustomImageSelection {
        const config = this.form.value.virtualMachineConfiguration;
        const ref = config && config.imageReference;
        if (ref && ref.virtualMachineImageId) {
            return {
                imageId: ref.virtualMachineImageId,
                nodeAgentSku: config.nodeAgentSKUId,
            };
        } else {
            return null;
        }
    }
    public form: FormGroup;

    // Shared to the view
    public PoolOsSources = PoolOsSources;
    public cloudServiceOsFamilies = cloudServiceOsFamilies;

    // VM
    public selectedOffer: string;
    public selectedSku: string;
    public selectedNodeAgentId: string;

    // Cloud service
    public selectedFamilyName: string;

    // Container configuration
    public showDataDiskPicker: boolean = false;
    public showContainerConfiguration: boolean = false;
    private _nodeAgentSkuMap: PoolOsSkus = new PoolOsSkus();
    private _destroy = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private poolOsService: PoolOsService) {
        this.poolOsService.offers.pipe(takeUntil(this._destroy)).subscribe((offers) => {
            this._nodeAgentSkuMap = offers;
        });

        this.form = this.formBuilder.group({
            virtualMachineConfiguration: [null],
            cloudServiceConfiguration: [null],
            containerConfiguration: [null],
            dataDisks: [[]],
        });

        this.form.valueChanges.pipe(
            takeUntil(this._destroy),
        ).subscribe((value) => {
            const vmConfig = value.virtualMachineConfiguration;
            this.selectedNodeAgentId = null;
            this.showContainerConfiguration = false;
            this.showDataDiskPicker = false;

            if (vmConfig) {
                this.showContainerConfiguration = true;
                this.showDataDiskPicker = true;

                const ref = vmConfig.imageReference;
                this.selectedOffer = ref && ref.offer;
                this.selectedSku = ref && ref.sku;
                this.selectedNodeAgentId = vmConfig && vmConfig.nodeAgentSKUId;
            } else if (value.cloudServiceConfiguration) {
                const familyId = value.cloudServiceConfiguration.osFamily;
                const item = cloudServiceOsFamilies.filter(x => x.id === familyId).first();
                this.selectedFamilyName = item && item.name;
            }

            const selection = this._buildSelection(value);
            this._propagateChange(selection);
            this.changeDetector.markForCheck();
        });
    }

    public writeValue(value: PoolOSPickerModel) {
        if (!value) {
            this.form.setValue({
                cloudServiceConfiguration: null,
                virtualMachineConfiguration: null,
                containerConfiguration: null,
                dataDisks: null,
            });
        } else {
            const vmConfig = value.virtualMachineConfiguration;
            const formValue = {
                cloudServiceConfiguration: value.cloudServiceConfiguration,
                virtualMachineConfiguration: vmConfig,
                containerConfiguration: null,
                dataDisks: null,
            };

            if (vmConfig && vmConfig.containerConfiguration) {
                formValue.containerConfiguration = vmConfig.containerConfiguration;
            }

            if (vmConfig && vmConfig.dataDisks) {
                formValue.dataDisks = vmConfig.dataDisks;
            }

            this.form.patchValue(formValue);
        }
    }

    public registerOnChange(fn: (value: PoolOSPickerModel) => void) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public validate(c: FormControl) {
        const value = this.form.value;
        if (!value || (!value.virtualMachineConfiguration && !value.cloudServiceConfiguration)) {
            return {
                validateOsPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }

        return null;
    }

    public pickContainerOffer(offer: Offer) {
        this.pickOffer(offer);
        this.showContainerConfiguration = true;
    }

    public pickContainerSku(offer: Offer, sku: Sku) {
        this.pickSku(offer, sku);
        this.showContainerConfiguration = true;
    }

    public pickOffer(offer: Offer) {
        this.pickSku(offer, offer.skus.last());
    }

    public pickSku(offer: Offer, sku: Sku) {
        // preventing user clicking pick same sku multiple times
        if (this.selectedOffer === offer.name &&
            this.selectedSku === sku.name &&
            this.selectedNodeAgentId === sku.nodeAgentId) {
            return;
        }
        this.form.patchValue({
            virtualMachineConfiguration: {
                nodeAgentSKUId: sku.nodeAgentId,
                imageReference: {
                    publisher: offer.publisher,
                    offer: offer.name,
                    sku: sku.name,
                },
            },
            cloudServiceConfiguration: null,
        });

        this.changeDetector.markForCheck();
    }

    public pickCloudService(version = null) {
        const osFamily = version || cloudServiceOsFamilies.first().id;
        this.form.patchValue({
            cloudServiceConfiguration: {
                osFamily,
            },
            virtualMachineConfiguration: null,
        });

        this.changeDetector.markForCheck();
    }

    public pickCustomImage(result: CustomImageSelection | null) {
        if (!result) { return; }

        this.form.patchValue({
            cloudServiceConfiguration: null,
            virtualMachineConfiguration: {
                imageReference: {
                    virtualMachineImageId: result.imageId,
                },
                nodeAgentSKUId: result.nodeAgentSku,
            },
        });
    }

    public clearContainerConfiguration() {
        this.form.patchValue({ containerConfiguration: null });
    }

    /**
     * Function that determines whether this OS is active or not
     * Two conditions must be satisfied
     * 1, selectedOffer equals current offer name
     * 2, selectedSku is in current offer sku list
     */
    public isOsActive(offer) {
        const hasSku = offer.skus.filter(x => x.name === this.selectedSku).length > 0;
        return offer.name === this.selectedOffer && hasSku;
    }

    public trackOffer(_, offer: Offer) {
        return offer.name;
    }

    public trackResource(_, image: Resource) {
        return image.id;
    }

    public trackNodeAgentSku(_, nodeAgent: NodeAgentSku) {
        return nodeAgent.id;
    }

    private _buildSelection(value): PoolOSPickerModel {
        if (value.cloudServiceConfiguration) {
            return {
                source: PoolOsSources.PaaS,
                cloudServiceConfiguration: value,
                virtualMachineConfiguration: null,
            };
        } else {
            const vmConfig: PoolOSPickerModel = {
                source: PoolOsSources.IaaS,
                cloudServiceConfiguration: null,
                virtualMachineConfiguration: value.virtualMachineConfiguration,
            };

            if (value.containerConfiguration) {
                vmConfig.virtualMachineConfiguration.containerConfiguration = value.containerConfiguration;
            }

            if (value.dataDisks) {
                vmConfig.virtualMachineConfiguration.dataDisks = value.dataDisks;
            }

            return vmConfig;
        }
    }

    private _propagateChange: (value: PoolOSPickerModel) => void = () => null;

}
