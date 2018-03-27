import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChildren, Input, QueryList, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { SelectOptionComponent } from "./option";

import "./select.scss";

@Component({
    selector: "bl-select",
    templateUrl: "select.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
    ],
})
export class SelectComponent implements ControlValueAccessor, AfterContentInit {
    @Input() public placeholder = "";

    /**
     * If the select accepts multiple values
     */
    @Input() public multiple = false;

    /**
     * If there select include a search box
     */
    @Input() public filterable = false;

    @ContentChildren(SelectOptionComponent)
    public options: QueryList<SelectOptionComponent>;

    public selected = new Set<any>();
    public showOptions = false;

    private _propagateChange: (value: any) => void;
    private _optionsMap: Map<any, SelectOptionComponent>;

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngAfterContentInit() {
        this._computeOptions();
        this.options.changes.subscribe(() => {
            this._computeOptions();
        });
    }

    public writeValue(value: any): void {
        if (this.multiple) {
            this.selected = new Set(value);
        } else {
            this.selected = new Set([value]);
        }
        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // nothing yet
    }

    public get hasValueSelected() {
        return this.selected.size > 0;
    }

    public get firstSelection() {
        return this._optionsMap.get([...this.selected].first());
    }

    public toggleDropdown() {
        this.showOptions = !this.showOptions;
        this.changeDetector.markForCheck();
    }

    private _computeOptions() {
        const optionsMap = new Map();
        this.options.forEach((option) => {
            optionsMap.set(option.value, option);
        });

        this._optionsMap = optionsMap;
        console.log("Got options?", this._optionsMap);
        this.changeDetector.markForCheck();
    }
}
