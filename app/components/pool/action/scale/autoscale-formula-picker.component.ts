import { Component, ElementRef, OnDestroy, OnInit, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AutoscaleFormula } from "app/models";
import { AutoscaleFormulaService } from "app/services";
import { List } from "immutable";
import { Subscription } from "rxjs";

import "./autoscale-formula-picker.scss";

@Component({
    selector: "bl-autoscale-formula-picker",
    templateUrl: "autoscale-formula-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
    ],
})
export class AutoscaleFormulaPickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
    public savedAutoscaleFormulas: List<AutoscaleFormula>;
    public autoscaleFormulaValue: string;
    public autoscaleFormulaName: FormControl;
    public showSaveForm: Boolean;
    @ViewChild("nameInput")
    public nameInput: ElementRef;
    public config = {
        lineNumbers: true,
        gutter: true,
        lineWrapping: true,
        mode: "autoscale",
        autoRefresh: true,
    };
    private _subs: Subscription[];
    private _propagateChange: Function;
    private _propagateTouch: Function;

    constructor(private autoscaleFormulaService: AutoscaleFormulaService, elRef: ElementRef) { }

    public ngOnInit() {
        this.autoscaleFormulaValue = "";
        this.autoscaleFormulaName = new FormControl("");
        this.showSaveForm = false;
        this.savedAutoscaleFormulas = List([]);
        this._subs = [];
        this._propagateChange = null;
        this._propagateTouch = null;
        this._subs.push(this.autoscaleFormulaService.formulas.subscribe((formulas) => {
            this.savedAutoscaleFormulas = formulas;
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(value: any) {
        this.autoscaleFormulaValue = value;
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn) {
        this._propagateTouch = fn;
    }

    public validate(c: FormControl) {
        return null;
    }

    public textEditorOnChange($event) {
        if (this._propagateChange && this.autoscaleFormulaValue !== null) {
            this._propagateChange(this.autoscaleFormulaValue);
        }
    }

    public textEditorOnBlur() {
        this._propagateTouch();
    }

    public addFormula() {
        this.showSaveForm = true;
        setTimeout(() => {
            this.nameInput.nativeElement.focus();
        });
    }

    public cancelAddFormula() {
        this.showSaveForm = false;
        this.autoscaleFormulaName.patchValue("");
    }

    public saveFormula() {
        const value = this.autoscaleFormulaValue;
        const name = this.autoscaleFormulaName.value;
        this.autoscaleFormulaService.saveFormula(new AutoscaleFormula({
            name,
            value,
        }));
        this.showSaveForm = false;
    }

    public selectFormula(formula: AutoscaleFormula) {
        this.autoscaleFormulaValue = formula.value;
    }

    public deleteFormula(formula: AutoscaleFormula) {
        this.autoscaleFormulaService.deleteFormula(formula);
    }
}
