import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { EditableTableColumnType } from "@batch-flask/ui/form/editable-table";
import { NetworkSecurityGroupRule, NetworkSecurityGroupRuleAccess } from "app/models";
import * as EndpointHelper from "./pool-endpoint-helper";

@Component({
    selector: "bl-network-security-group-rules",
    templateUrl: "network-security-group-rules.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NetworkSecurityGroupRulesComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => NetworkSecurityGroupRulesComponent), multi: true },
    ],
})
export class NetworkSecurityGroupRulesComponent implements ControlValueAccessor, OnDestroy {
    public EditableTableColumnType = EditableTableColumnType;
    public rules: FormControl;
    public allowSelections: string[] = [
        NetworkSecurityGroupRuleAccess.Allow,
        NetworkSecurityGroupRuleAccess.Deny,
    ];

    private _propagateChange: (value: NetworkSecurityGroupRule[]) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.rules = this.formBuilder.control([]);
        this._sub = this.rules.valueChanges.subscribe((rules) => {
            const decoratedRules = rules ? rules.map(rule => {
                return {
                    access: rule.access,
                    priority: parseInt(rule.priority, 10),
                    sourceAddressPrefix: rule.sourceAddressPrefix,
                } as NetworkSecurityGroupRule;
            }) : null;
            if (this._propagateChange) {
                this._propagateChange(decoratedRules);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: NetworkSecurityGroupRule[]) {
        if (value) {
            this.rules.setValue(value);
        } else {
            this.rules.reset();
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        if (Array.isArray(c.value)) {
            if (c.value.length > EndpointHelper.MAXIMUM_SECURITY_GROUP_RULES) {
                return {
                    maximumReached: {
                        valid: false,
                    },
                };
            }
            const uniquePriorities = [...new Set(c.value.map(item => item.priority))];
            if (uniquePriorities.length !== c.value.length) {
                return {
                    duplicatePriority: {
                        valid: false,
                    },
                };
            }

            let outOfRange = false;
            for (const rule of c.value) {
                if (rule.priority > EndpointHelper.MAXIMUM_SECURITY_GROUP_RULE_PRIORITY ||
                    rule.priority < EndpointHelper.MINIMUM_SECURITY_GROUP_RULE_PRIORITY) {
                    outOfRange = true;
                    break;
                }
            }

            if (outOfRange) {
                return {
                    outOfRange: {
                        valid: false,
                    },
                };
            }
        }
        return null;
    }
}
