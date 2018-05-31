import { Component, Input, OnChanges, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { Subscription } from "rxjs";

import { NcjParameterRawType } from "app/models";
import { NcjFileGroupService } from "app/services";
import { NcjParameterExtendedType, NcjParameterWrapper } from "../market-application.model";

import "./parameter-input.scss";

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

    constructor(private fileGroupService: NcjFileGroupService) {
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
        return this.fileGroupService.addFileGroupPrefix(fileGroup);
    }

    public ngOnDestroy(): void {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(value: any) {
        // persisted value will not have the file group prefix. need to add it to fix
        // validation error for recent templates.
        if (this.parameter.type === NcjParameterExtendedType.fileGroup && Boolean(value)) {
            value = this.getContainerFromFileGroup(value);
        }

        this.parameterValue.setValue(value);
    }

    public validate() {
        if (this.parameterValue.valid) {
            return null;
        } else {
            let messageText = "unknown error";
            const error = this.parameterValue.errors;
            if (error.minlength) {
                const minLength = String(error.minlength.requiredLength);
                messageText = `Should be at least ${minLength} characters`;
            } else if (error.maxlength) {
                const maxLength = String(error.maxlength.requiredLength);
                messageText = `Should be at most ${maxLength} characters`;
            } else if (error.min) {
                const minValue = String(error.min.min);
                messageText = `Should be greater than or equal to ${minValue}`;
            } else if (error.max) {
                const maxValue = String(error.max.max);
                messageText = `Should be less than or equal to ${maxValue}`;
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

    public trackOption(index, option: string) {
        return option;
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
