import { Component, Input, OnChanges, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { NcjParameterRawType } from "app/models";
import { Subscription } from "rxjs";
import { NcjParameterExtendedType, NcjParameterWrapper } from "./market-application.model";
import "./parameter-input.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-parameter-input",
    templateUrl: "parameter-input.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ParameterInputComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ParameterInputComponent), multi: true },
    ],
})
export class ParameterInputComponent implements ControlValueAccessor, OnChanges, OnDestroy {
    public NcjParameterExtendedType = NcjParameterExtendedType;

    @Input() public parameter: NcjParameterWrapper;
    @Input() public parameterValues: StringMap<any>;
    public parameterValue = new FormControl();
    private _propagateChange: (value: any) => void = null;
    private _subs: Subscription[] = [];

    constructor() {
        this._subs.push(this.parameterValue.valueChanges.distinctUntilChanged()
            .subscribe((query: string) => {
                if (this._propagateChange) {
                    this._propagateChange(query);
                }
            }),
        );
    }

    public ngOnChanges(changes) {
        if (changes.parameter) {
            this._updateValidators();
        }
    }

    public getContainerFromFileGroup(fileGroup: string) {
        return fileGroup && `fgrp-${fileGroup}`;
    }

    public ngOnDestroy(): void {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(value: any) {
        this.parameterValue.setValue(value);
    }

    public validate() {
        const valid = this.parameterValue.valid;
        if (valid) {
            return null;
        } else {
            let messageText = "unknown error";
            if (this.parameterValue.errors.minLength) {
                messageText = "FormControl minLength error";
            } else if (this.parameterValue.errors.maxLength) {
                messageText = "FormControl maxLength error";
            } else if (this.parameterValue.errors.minValue) {
                messageText = "FormControl maxValue error";
            } else if (this.parameterValue.errors.maxValue) {
                messageText = "FormControl maxValue error";
            }
            return {
                validFormInput: {
                    valid: false,
                    message: messageText,
                },
            };
        }
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // do not need
    }

    private _updateValidators() {
        const validatorGroup: any[] = [];
        const parameterTemplate = this.parameter.param;
        if (parameterTemplate.type === NcjParameterRawType.int) {
            if (parameterTemplate.minValue) {
                validatorGroup.push(Validators.min(parameterTemplate.minValue));
            }
            if (parameterTemplate.maxValue) {
                validatorGroup.push(Validators.max(parameterTemplate.maxValue));
            }
        }
        if (parameterTemplate.type === NcjParameterRawType.string) {
            if (parameterTemplate.minLength) {
                validatorGroup.push(Validators.minLength(parameterTemplate.minLength));
            }
            if (parameterTemplate.maxLength) {
                validatorGroup.push(Validators.maxLength(parameterTemplate.maxLength));
            }
        }
        this.parameterValue.setValidators(Validators.compose(validatorGroup));
    }
}
