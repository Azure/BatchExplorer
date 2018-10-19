import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
    HostBinding, Inject, forwardRef,
} from "@angular/core";
import { SelectOptionComponent } from "@batch-flask/ui/select/option";

import { SelectComponent } from "../select.component";
import "./select-dropdown.scss";

const unselectAllOptionId = "_bl-select-option-unselect-all";

@Component({
    selector: "bl-select-dropdown",
    templateUrl: "select-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDropdownComponent {
    @HostBinding("class.pos-above") public above = false;

    @HostBinding("attr.id") public id: string;
    @HostBinding("attr.role") public readonly role = "listbox";
    @HostBinding("attr.aria-activedescendant") public get ariaActiveDescendant() {
        return this.focusedOption && this.focusedOption.id;
    }
    @HostBinding("attr.aria-multiselectable") public get ariaMultiselectable() {
        return this.multiple;
    }

    public set displayedOptions(options: SelectOptionComponent[]) {
        this._displayedOptions = options;
        this._computeOptions();
        this.changeDetector.markForCheck();
    }

    public get displayedOptions() {
        return this._displayedOptions;
    }

    public set focusedOption(option: any) {
        this._focusedOption = option;
        this.changeDetector.markForCheck();
    }

    public get focusedOption() {
        return this._focusedOption;
    }

    public set selected(selected: Set<string>) {
        this._selected = selected;
        this.changeDetector.markForCheck();
    }

    public get selected() {
        return this._selected;
    }

    public set multiple(multiple: boolean) {
        this._multiple = multiple;
        this._computeOptions();
    }

    public get multiple() {
        return this._multiple;
    }

    public rows: any;
    private _displayedOptions: SelectOptionComponent[] = [];
    private _focusedOption: any;
    private _multiple: any;
    private _selected: Set<string> = new Set();

    constructor(
        @Inject(forwardRef(() => SelectComponent)) public select: any,
        private elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef) {
    }
    /**
     * Scroll to the option at the given index
     * @param index Index of the option
     */
    public scrollToIndex(index: number) {
        const el: HTMLElement = this.elementRef.nativeElement;
        const height = el.getBoundingClientRect().height;
        const current = el.scrollTop;
        const scrollTopMin = (index + 1) * 24 - height;
        const scrollTopMax = (index - 1) * 24;

        const scrollTop = Math.min(Math.max(scrollTopMin, current), scrollTopMax);
        el.scrollTop = Math.max(scrollTop, 0);
    }

    public handleClickOption(event: Event, option: SelectOptionComponent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (option.disabled) {
            return;
        }
        if (option.value === unselectAllOptionId) {
            this.select.unselectAll();
            return;
        }
        this.select.selectOption(option);
    }

    public trackOption(index, option: SelectOptionComponent) {
        return option.value;
    }

    private _computeOptions() {
        let fixedOptions = [];
        if (this.multiple) {
            fixedOptions = [{ value: unselectAllOptionId, label: "Unselect all", cssClass: "unselect-all-option" }];
        }
        this.rows = fixedOptions.concat(this._displayedOptions);
        this.changeDetector.markForCheck();
    }
}
