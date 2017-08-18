import { Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NcjJobTemplate, NcjParameter, NcjPoolTemplate } from "app/models";
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

    @Input()
    public parameter: NcjParameter;

    @Input()
    public type;

    private _propagateChange: (value: any) => void = null;

    constructor() {
        console.log("Contructor:", this.parameter, this.type);
    }

    public printTypes(){
        // do nothing
    }

    public ngOnInit(): void {
        // do nothing yet
    }

    public ngOnDestroy(): void {
        // do nothing
    }
    public writeValue(poolInfo: any) {
        console.log("Write value: ", poolInfo);
    }

    public validate() {
        return null;
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
        console.log("RegisterOnChange: ", this._propagateChange);

    }
    public registerOnTouched(fn: any): void {
        // do nothing
    }

}
