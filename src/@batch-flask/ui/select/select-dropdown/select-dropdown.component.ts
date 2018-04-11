import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
    HostBinding, Inject, forwardRef,
} from "@angular/core";
import { SelectOptionComponent } from "@batch-flask/ui/select/option";

import { SelectComponent } from "../select.component";
import "./select-dropdown.scss";

@Component({
    selector: "bl-select-dropdown",
    templateUrl: "select-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDropdownComponent {
    @HostBinding("class.pos-above")
    public above = false;

    public set displayedOptions(options: SelectOptionComponent[]) {
        this._displayedOptions = options;
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

    public set multiple(multiple: boolean) {
        this._multiple = multiple;
        this.changeDetector.markForCheck();
    }

    public get multiple() {
        return this._multiple;
    }
    private _displayedOptions: SelectOptionComponent[] = [];
    private _focusedOption: any;
    private _multiple: any;

    constructor(
        @Inject(forwardRef(() => SelectComponent)) private select: SelectComponent,
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
        event.stopPropagation();
        if (option.disabled) {
            return;
        }
        this.select.selectOption(option);
    }
}
