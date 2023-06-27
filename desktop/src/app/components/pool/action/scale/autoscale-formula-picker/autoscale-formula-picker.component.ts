import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    forwardRef,
} from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DialogService } from "@batch-flask/ui/dialogs";
import { EditorConfig } from "@batch-flask/ui/editor";
import { AutoscaleFormula, Pool } from "app/models";
import { AutoscaleFormulaService } from "app/services";
import { PredefinedFormulaService } from "app/services/predefined-formula.service";
import { List } from "immutable";
import { Subscription } from "rxjs";

import "./autoscale-formula-picker.scss";

@Component({
    selector: "bl-autoscale-formula-picker",
    templateUrl: "autoscale-formula-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AutoscaleFormulaPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoscaleFormulaPickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() public pool: Pool;

    public savedAutoscaleFormulas: List<AutoscaleFormula>;
    public predefinedFormula: AutoscaleFormula[];
    public autoscaleFormulaValue: string;

    @ViewChild("nameInput", { static: false })
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
        private changeDetector: ChangeDetectorRef,
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
            this.changeDetector.markForCheck();
        }));
        this.predefinedFormulaService.predefinedFormulas.subscribe(formulas => {
            this.predefinedFormula = formulas;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(value: string) {
        this.autoscaleFormulaValue = value;
        this.changeDetector.markForCheck();
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
        this.changeDetector.markForCheck();
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
        this.updateAutoScaleForumla(formula.value);
    }

    public deleteFormula(formula: AutoscaleFormula) {
        this.autoscaleFormulaService.deleteFormula(formula).subscribe();
    }

    public trackFormula(index, formula: AutoscaleFormula) {
        return formula.id;
    }

    private _saveFormula(name: string) {
        const value = this.autoscaleFormulaValue;
        return this.autoscaleFormulaService.saveFormula(new AutoscaleFormula({
            name,
            value,
        }));
    }
}
