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

    @ViewChild("selectButton", { read: ElementRef }) private _selectButtonEl: ElementRef;
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
            this.selected = new Set(value ? [value] : []);
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
            this.showOptions = false;
            this.changeDetector.markForCheck();
        }
    }

    public clickSelectButton(event: Event) {
        this.toggleDropdown();
        event.stopPropagation();
    }

    @HostListener("keydown", ["$event"])
    public handleKeyboardNavigation(event: KeyboardEvent) {
        if (this.displayedOptions.length === 0) { return; }
        let direction = null;
        const lastIndex = this.displayedOptions.findIndex(x => x.value === this.focusedOption);
        const option = this.displayedOptions[lastIndex];
        switch (event.code) {
            case "ArrowDown": // Move focus down
                if (this.showOptions) {
                    direction = 1;
                } else {
                    this.openDropdown();
                }
                event.preventDefault();
                break;
            case "ArrowUp":   // Move focus up
                if (this.showOptions) {
                    direction = -1;
                }
                event.preventDefault();
                break;
            case "Enter":
                this.selectOption(option);
                event.preventDefault();
                return;
            case "Escape":
                this.closeDropdown();
                this.changeDetector.markForCheck();
                return;
            default:
        }
        const index = this._moveFocusInDirection(lastIndex, direction);
        this.changeDetector.markForCheck();
        if (lastIndex !== index) {
            this.scrollToIndex(index);
        }
    }

    public get hasValueSelected() {
        return this.selected.size > 0;
    }

    public get hasMultipleSelected() {
        return this.selected.size > 1;
    }

    public get firstSelection() {
        return this._optionsMap.get([...this.selected].first());
    }

    public toggleDropdown() {
        if (this.showOptions) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    public openDropdown() {
        this.showOptions = true;
        if (this.filterable) {
            if (!this.focusedOption) {
                this.focusFirstOption();
            }
            setTimeout(() => {
                this._filterInputEl.nativeElement.focus();
            });
        }
        this.changeDetector.markForCheck();
    }

    public closeDropdown() {
        this.showOptions = false;
        setTimeout(() => {
            console.log("Select", this._selectButtonEl);
            this._selectButtonEl.nativeElement.focus();
        });

        this.changeDetector.markForCheck();
    }

    public handleClickOption(event: Event, option: SelectOptionComponent) {
        event.stopPropagation();
        if (option.disabled) {
            return;
        }
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
            if (this.multiple) {
                this._propagateChange([...this.selected]);
            } else {
                this._propagateChange([...this.selected].first());
            }
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

    /**
     * Move the focus
     * @param index Current index
     * @param direction
     */
    private _moveFocusInDirection(index: number, direction: 1 | -1 | null) {
        if (!direction) { return index; }
        let option;
        do {
            index = this._wrapIndex(index + direction);
            option = this.displayedOptions[index];
            this.focusedOption = option.value;
        } while (option.disabled);
        return index;
    }

    private _wrapIndex(index: number): number {
        return (index + this.displayedOptions.length) % this.displayedOptions.length;
    }

}
