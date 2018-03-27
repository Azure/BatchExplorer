import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChildren, ElementRef, HostListener, Input, QueryList, ViewChild, forwardRef,
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
    public filter: string = "";
    public displayedOptions: SelectOptionComponent[];
    public focusedOption: any = null;

    @ViewChild("filterInput") private _filterInputEl: ElementRef;
    @ViewChild("dropdown") private _dropdownEl: ElementRef;

    private _propagateChange: (value: any) => void;
    private _optionsMap: Map<any, SelectOptionComponent>;

    constructor(private changeDetector: ChangeDetectorRef, private elementRef: ElementRef) {

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

    @HostListener("document:click", ["$event"])
    public onClick(event: Event) {
        if (this.showOptions && !this.elementRef.nativeElement.contains(event.target)) {
            console.log("Target", event.target);
            this.showOptions = false;
            this.changeDetector.markForCheck();
        }
    }

    @HostListener("keydown", ["$event"])
    public handleKeyboardNavigation(event: KeyboardEvent) {
        if (this.displayedOptions.length === 0) { return; }

        let index = this.displayedOptions.findIndex(x => x.value === this.focusedOption);
        const lastIndex = index;
        const option = this.displayedOptions[index];
        switch (event.code) {
            case "ArrowDown": // Move focus down
                index++;
                event.preventDefault();
                break;
            case "ArrowUp":   // Move focus up
                index--;
                event.preventDefault();
                break;
            case "Enter":
                this.selectOption(option);
                event.preventDefault();
                return;
            case "Escape":
                this.showOptions = false;
                this.changeDetector.markForCheck();
                return;
            default:
        }
        index = (index + this.displayedOptions.length) % this.displayedOptions.length;
        this.focusedOption = this.displayedOptions[index].value;
        this.changeDetector.markForCheck();
        if (lastIndex !== index) {
            this.scrollToIndex(index);
        }
    }

    public get hasValueSelected() {
        return this.selected.size > 0;
    }

    public get firstSelection() {
        return this._optionsMap.get([...this.selected].first());
    }

    public toggleDropdown() {
        this.showOptions = !this.showOptions;
        if (this.showOptions && this.filterable) {
            if (!this.focusedOption) {
                this.focusFirstOption();
            }
            setTimeout(() => {
                this._filterInputEl.nativeElement.focus();
            });
        }
        this.changeDetector.markForCheck();
    }

    public handleClickOption(event: Event, option: SelectOptionComponent) {
        event.stopPropagation();
        this.selectOption(option);
    }

    public selectOption(option: SelectOptionComponent) {
        this.focusedOption = option.value;
        if (this.multiple) {
            if (this.selected.has(option.value)) {
                this.selected.delete(option.value);
            } else {
                this.selected.add(option.value);
            }
        } else {
            this.selected = new Set([option.value]);
            this.showOptions = false;
        }
        this.notifyChanges();
        this.changeDetector.markForCheck();
    }

    public notifyChanges() {
        if (this._propagateChange) {
            console.log("Changes", [...this.selected]);
            this._propagateChange([...this.selected]);
        }
    }

    public filterChanged(filter: string) {
        this.filter = filter;
        this._computeDisplayedOptions();
    }

    public focusFirstOption() {
        if (this.displayedOptions.length === 0) {
            return;
        }
        this.focusedOption = this.displayedOptions.first().value;
        this.changeDetector.markForCheck();
    }

    public trackOption(index, option: SelectOptionComponent) {
        return option.value;
    }

    /**
     * Scroll to the option at the given index
     * @param index Index of the option
     */
    public scrollToIndex(index: number) {
        const el: HTMLElement = this._dropdownEl.nativeElement;
        const height = el.getBoundingClientRect().height;
        const current = el.scrollTop;
        const scrollTopMin = (index + 1) * 24 - height;
        const scrollTopMax = (index - 1) * 24;

        const scrollTop = Math.min(Math.max(scrollTopMin, current), scrollTopMax);
        el.scrollTop = Math.max(scrollTop, 0);
    }

    private _computeOptions() {
        const optionsMap = new Map();
        this.options.forEach((option) => {
            optionsMap.set(option.value, option);
        });

        this._optionsMap = optionsMap;
        this._computeDisplayedOptions();
    }

    private _computeDisplayedOptions() {
        const options = [];
        let focusedOptionIncluded = false;
        this.options.forEach((option) => {
            if (!this.filter
                || option.value.toLowerCase().contains(this.filter.toLowerCase())
                || option.label.toLowerCase().contains(this.filter.toLowerCase())) {
                options.push(option);

                if (option.value === this.focusedOption) {
                    focusedOptionIncluded = true;
                }
            }
        });
        this.displayedOptions = options;

        // If the filter makes it that we don't see the currently focusesd option fallback to focussing the first item
        if (!focusedOptionIncluded) {
            this.focusFirstOption();
        }
        this.changeDetector.markForCheck();
    }
}
