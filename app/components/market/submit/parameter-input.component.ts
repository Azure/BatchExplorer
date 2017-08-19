import { Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NcjParameter } from "app/models";
import { Subscription } from "rxjs";
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
export class ParameterInputComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input() public parameter: NcjParameter;

    @Input() public type;

    @Input() public parameterValues: StringMap<any>;

    public parameterValue = new FormControl();
    private _propagateChange: (value: any) => void = null;
    private _subs: Subscription[] = [];

    constructor() {
        this._subs.push(this.parameterValue.valueChanges.debounceTime(100).distinctUntilChanged()
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

    public ngOnInit(): void {
        this.parameterValue.setValue(this.parameter.defaultValue);
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
        this.parameterValue.markAsTouched();
    }
}
