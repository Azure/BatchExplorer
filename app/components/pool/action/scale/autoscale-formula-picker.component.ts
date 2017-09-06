import { Component, ElementRef, OnDestroy, OnInit, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { DialogService } from "app/components/base/dialogs";
import { AutoscaleFormula } from "app/models";
import { AutoscaleFormulaService } from "app/services";
import { PredefinedFormulaService } from "app/services/predefined-formula.service";
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
    public predefinedFormula: AutoscaleFormula[];
    public autoscaleFormulaValue: string;

    @ViewChild("nameInput")
    public nameInput: ElementRef;
    public config = {
        lineNumbers: true,
        gutter: true,
        lineWrapping: true,
        mode: "autoscale",
        autoRefresh: true,
    };

    public customFormulaMode = true;
    private _subs: Subscription[];
    private _propagateChange: (value: string) => void;
    private _propagateTouch: () => void;

    constructor(
        private autoscaleFormulaService: AutoscaleFormulaService,
        private predefinedFormulaService: PredefinedFormulaService,
        private dialogService: DialogService,
        elRef: ElementRef) { }

    public ngOnInit() {
        this.autoscaleFormulaValue = "";
        this.savedAutoscaleFormulas = List([]);
        this._subs = [];
        this._propagateChange = null;
        this._propagateTouch = null;
        this._subs.push(this.autoscaleFormulaService.formulas.subscribe((formulas) => {
            this.savedAutoscaleFormulas = formulas;
        }));
        this.predefinedFormulaService.predefinedFormulas.subscribe(formulas => this.predefinedFormula = formulas);
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
        this.dialogService.prompt("Save formula", {
            prompt: (name) => this._saveFormula(name),
        });
    }

    public selectFormula(formula: AutoscaleFormula) {
        this.autoscaleFormulaValue = formula.value;
    }

    public deleteFormula(formula: AutoscaleFormula) {
        this.autoscaleFormulaService.deleteFormula(formula);
    }

    private _saveFormula(name: string) {
        const value = this.autoscaleFormulaValue;
        this.autoscaleFormulaService.saveFormula(new AutoscaleFormula({
            name,
            value,
        }));
        return Observable.of({});
    }
}
