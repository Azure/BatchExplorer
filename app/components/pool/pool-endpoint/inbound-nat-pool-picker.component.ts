import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { InboundEndpointProtocol, InboundNATPool } from "app/models";

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
    public InboundEndpointProtocol = InboundEndpointProtocol;
    public form: FormGroup;

    private _propagateChange: (value: InboundNATPool) => void = null;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            backendPort: ["", Validators.required],
            frontendPortRangeEnd: ["", Validators.required],
            frontendPortRangeStart: ["", Validators.required],
            name: ["", Validators.required],
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
}
