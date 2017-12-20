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
    public minPort = EndpointHelper.MININUM_PORT;
    public maxBackendPort = EndpointHelper.MAXIMUM_BACKEND_PORT;
    public reservedBackendPort = EndpointHelper.RESERVED_BACKEND_PORT;
    public maxFronendPort = EndpointHelper.MAXIMUM_FRONTEND_PORT;
    public minReservedFrontend = EndpointHelper.MINIMUM_RESERVED_FRONTEND_PORT;
    public maxReservedFrontend = EndpointHelper.MAXIMUM_RESERVED_FRONTEND_PORT;
    public minFrontendRange = EndpointHelper.MINIMUM_FRONTEND_PORT_RANGE;
    public maxRules = EndpointHelper.MAXIMUM_SECURITY_GROUP_RULES;
    public minRulePriority = EndpointHelper.MINIMUM_SECURITY_GROUP_RULE_PRIORITY;
    public maxRulePriority = EndpointHelper.MAXIMUM_SECURITY_GROUP_RULE_PRIORITY;
    public maxEndpointNameLength = EndpointHelper.ENDPOINTNAME_LENGTH;
    public form: FormGroup;
    public otherInboundNATPools: InboundNATPool[];

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
        this.otherInboundNATPools = value ? this.inboundNATPools.filter(pool => {
            return  pool.frontendPortRangeStart !== value.frontendPortRangeStart &&
                    pool.frontendPortRangeEnd !== value.frontendPortRangeEnd &&
                    pool.name !== value.name &&
                    pool.backendPort !== value.backendPort;
        }) : this.inboundNATPools;
        this._setDynamicValidators();
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
        if (!valid) {
            return {
                inboundNATPool: {
                    valid: false,
                },
            };
        }
        return null;
    }

    public get networkSecurityGroupRules() {
        return this.form.controls.networkSecurityGroupRules;
    }

    private _setDynamicValidators() {

        this.form.controls["backendPort"].setValidators([
            Validators.required,
            EndpointHelper.backendPortValidator(this.otherInboundNATPools),
        ]);
        this.form.controls["name"].setValidators([
            Validators.required,
            EndpointHelper.nameValidator(this.otherInboundNATPools),
        ]);
        // this.form.controls["networkSecurityGroupRules"].setValidators([
        //     EndpointHelper.networkSecurityGroupRulesValidator(this.otherInboundNATPools),
        // ]);
        this.form.setValidators(
            EndpointHelper.frontendPortRangeValidator(
                "frontendPortRangeStart", "frontendPortRangeEnd", this.otherInboundNATPools),
        );
    }
}
