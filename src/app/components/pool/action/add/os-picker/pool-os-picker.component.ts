import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { NodeAgentSku, Offer, Resource } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import "./pool-os-picker.scss";

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
    public form: FormGroup;

    // Container configuration
    public showDataDiskPicker: boolean = false;
    public showContainerConfiguration: boolean = false;
    private _destroy = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private changeDetector: ChangeDetectorRef) {

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

            if (vmConfig) {
                this.showContainerConfiguration = true;
                this.showDataDiskPicker = true;
            } else {
                this.showContainerConfiguration = false;
                this.showDataDiskPicker = false;
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

    public clearContainerConfiguration() {
        this.form.patchValue({ containerConfiguration: null });
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
                cloudServiceConfiguration: value.cloudServiceConfiguration,
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
