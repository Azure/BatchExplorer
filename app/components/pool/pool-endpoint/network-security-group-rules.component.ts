import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { NetworkSecurityGroupRule } from "app/models";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-network-security-group-rules",
    templateUrl: "network-security-group-rules.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NetworkSecurityGroupRulesComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => NetworkSecurityGroupRulesComponent), multi: true },
    ],
})
export class NetworkSecurityGroupRulesComponent implements ControlValueAccessor, OnDestroy {
    public rules: FormControl;

    private _propagateChange: (value: NetworkSecurityGroupRule[]) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.rules = this.formBuilder.control([]);
        this._sub = this.rules.valueChanges.subscribe((rules) => {
            if (this._propagateChange) {
                this._propagateChange(rules);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: NetworkSecurityGroupRule[]) {
        if (value) {
            this.rules.setValue(value);
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }
}
