import { Component, Input, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
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
export class ParameterInputComponent implements ControlValueAccessor, OnDestroy {
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
        return null;
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // do not need
    }
}
