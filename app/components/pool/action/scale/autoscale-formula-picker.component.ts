import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AutoScaleRunError } from "azure-batch/typings/lib/models";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { DialogService } from "@batch-flask/ui/dialogs";
import { EditorConfig } from "@batch-flask/ui/editor";
import { log } from "@batch-flask/utils";
import { AutoscaleFormula, Pool } from "app/models";
import { AutoscaleFormulaService, PoolService } from "app/services";
import { PredefinedFormulaService } from "app/services/predefined-formula.service";
import "./autoscale-formula-picker.scss";

@Component({
    selector: "bl-autoscale-formula-picker",
    templateUrl: "autoscale-formula-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
    ],
})
export class AutoscaleFormulaPickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() public pool: Pool;

    public savedAutoscaleFormulas: List<AutoscaleFormula>;
    public predefinedFormula: AutoscaleFormula[];
    public autoscaleFormulaValue: string;
    public evaluationResults: string[] = [];
    public evaluationError: AutoScaleRunError;

    @ViewChild("nameInput")
    public nameInput: ElementRef;
    public config: EditorConfig = {
        language: "batch-autoscale",
        minimap: {
            enabled: false,
        },
    };

    public splitPaneConfig = {
        firstPane: {
            minSize: 200,
        },
        secondPane: {
            minSize: 205,
        },
        initialDividerPosition: -205,
    };

    public customFormulaMode = true;
    private _subs: Subscription[];
    private _propagateChange: (value: string) => void;
    private _propagateTouch: () => void;

    constructor(
        private poolService: PoolService,
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

    public updateAutoScaleForumla(formula: string) {
        this.autoscaleFormulaValue = formula;
        if (this._propagateChange && this.autoscaleFormulaValue !== null) {
            this._propagateChange(this.autoscaleFormulaValue);
        }
    }

    public textEditorOnBlur() {
        this._propagateTouch();
    }

    public get canEvaluateFormula() {
        return this.pool && this.pool.enableAutoScale;
    }

    public addFormula() {
        this.dialogService.prompt("Save formula", {
            prompt: (name) => this._saveFormula(name),
        });
    }

    public evaluateFormula() {
        if (!this.canEvaluateFormula || !this.autoscaleFormulaValue) {
            return;
        }

        this.poolService.evaluateAutoScale(this.pool.id, this.autoscaleFormulaValue).subscribe({
            next: (value: any) => {
                if (value.results) {
                    this.evaluationResults = value.results.split(";");
                } else {
                    this.evaluationResults = [];
                }
                this.evaluationError = value.error;
            },
            error: (error) => {
                log.error("Error while evaluating autoscale formula", error.original);
            },
        });
    }

    public selectFormula(formula: AutoscaleFormula) {
        this.autoscaleFormulaValue = formula.value;
    }

    public deleteFormula(formula: AutoscaleFormula) {
        this.autoscaleFormulaService.deleteFormula(formula);
    }

    public trackFormula(index, formula: AutoscaleFormula) {
        return formula.id;
    }

    public trackEvaluationErrors(index, error: AutoScaleRunError) {
        return index;
    }

    public trackEvaluationResult(index, result: string) {
        return result;
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
