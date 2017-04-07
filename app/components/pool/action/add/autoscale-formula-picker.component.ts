import { Component, ElementRef, OnDestroy, OnInit, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AutoscaleFormula } from "app/models";
import { AutoscaleFormulaService } from "app/services";
import { List } from "immutable";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-autoscale-formula-picker",
    templateUrl: "autoscale-formula-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
    ],
    styles: [ ":host /deep/ .CodeMirror { display:block;width:100%; height:200px;}" ],
})
export class AutoscaleFormulaPickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
    public savedAutoscaleFormulas: List<AutoscaleFormula>;
    public autoscaleFormulaValue: string;
    public autoscaleFormulaName: FormControl;
    public showSaveForm: Boolean;
    public isTextEditorFocused: Boolean;
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

    constructor(private autoscaleFormulaService: AutoscaleFormulaService, elRef: ElementRef) { }

    public ngOnInit() {
        this.autoscaleFormulaValue = "";
        this.autoscaleFormulaName = new FormControl("");
        this.showSaveForm = false;
        this.isTextEditorFocused = false;
        this.savedAutoscaleFormulas = List([]);
        this._subs  = [];
        this._propagateChange = null;
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

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        if (!this.autoscaleFormulaValue) {
            return {
                autoscaleFormulaPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }
        return null;
    }

    public textEditorOnChange($event) {
        if (this._propagateChange && this.autoscaleFormulaValue) {
            this._propagateChange(this.autoscaleFormulaValue);
        }
    }

    public textEditorOnfocus() {
        this.isTextEditorFocused = true;
    }

    public textEditorOnBlur() {
        this.isTextEditorFocused = false;
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
