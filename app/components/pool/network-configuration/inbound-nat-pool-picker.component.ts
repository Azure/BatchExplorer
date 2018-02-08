import { Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { InboundEndpointProtocol, InboundNATPool } from "app/models";
import "./inbound-nat-pool-picker.scss";
import * as EndpointHelper from "./pool-endpoint-helper";

@Component({
    selector: "bl-inbound-nat-pool-picker",
    templateUrl: "inbound-nat-pool-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InboundNATPoolPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => InboundNATPoolPickerComponent), multi: true },
    ],
})
export class InboundNATPoolPickerComponent implements ControlValueAccessor, Validator, OnDestroy {
    @Input() public inboundNATPools: InboundNATPool[];

    public InboundEndpointProtocol = InboundEndpointProtocol;
    public EndpointHelper = EndpointHelper;
    public form: FormGroup;

    private _propagateChange: (value: InboundNATPool) => void = null;
    private _sub: Subscription;

    constructor(public formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({
            backendPort: [""],
            frontendPortRangeEnd: ["", [
                Validators.required,
                EndpointHelper.frontendPortValidator(),
            ]],
            frontendPortRangeStart: ["", [
                Validators.required,
                EndpointHelper.frontendPortValidator(),
            ]],
            name: [""],
            networkSecurityGroupRules: [[]],
            protocol: [InboundEndpointProtocol.TCP],
        });

        this._sub = this.form.valueChanges.subscribe((values: any) => {
            if (this._propagateChange) {
                this._propagateChange(values);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: InboundNATPool) {
        this._setDynamicValidators(value);
        if (value) {
            this.form.patchValue(value);
        } else {
            this.form.reset();
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (valid) {
            return null;
        }
        return {
            inboundNATPool: {
                valid: false,
            },
        };
    }

    public get networkSecurityGroupRules() {
        return this.form.controls.networkSecurityGroupRules;
    }

    private _setDynamicValidators(value: InboundNATPool) {
        const otherInboundNATPools = value ? this.inboundNATPools.filter(pool => {
            return  pool.frontendPortRangeStart !== value.frontendPortRangeStart &&
                    pool.frontendPortRangeEnd !== value.frontendPortRangeEnd &&
                    pool.name !== value.name &&
                    pool.backendPort !== value.backendPort;
        }) : this.inboundNATPools;
        this.form.controls["backendPort"].setValidators([
            Validators.required,
            EndpointHelper.backendPortValidator(otherInboundNATPools),
        ]);
        this.form.controls["name"].setValidators([
            Validators.required,
            EndpointHelper.nameValidator(otherInboundNATPools),
        ]);
        this.form.setValidators([
            EndpointHelper.frontendPortRangeValidator(
                "frontendPortRangeStart", "frontendPortRangeEnd", otherInboundNATPools),
            EndpointHelper.networkSecurityGroupRuleValidator(
                "networkSecurityGroupRules", otherInboundNATPools),
        ]);
    }
}
