import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ComponentRef, ContentChildren, ElementRef, HostListener,
    Injector, Input, OnDestroy, QueryList, ViewChild, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { SelectOptionComponent } from "./option";

import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { SelectDropdownComponent } from "@batch-flask/ui/select/select-dropdown";
import { Subscription } from "rxjs";
import "./select.scss";

/** Custom injector type specifically for instantiating components with a dialog. */
export class SelectInjector implements Injector {
    constructor(private select: SelectComponent, private parentInjector: Injector) { }

    public get(token: any, notFoundValue?: any): any {
        if (token === SelectComponent) {
            return this.select;
        }

        return this.parentInjector.get(token, notFoundValue);
    }
}

@Component({
    selector: "bl-select",
    templateUrl: "select.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
    ],
})
export class SelectComponent implements ControlValueAccessor, AfterContentInit, OnDestroy {
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
    public filter: string = "";
    public set displayedOptions(displayedOptions: SelectOptionComponent[]) {
        this._displayedOptions = displayedOptions;
        if (this._dropdownRef) { this._dropdownRef.instance.displayedOptions = displayedOptions; }
    }
    public get displayedOptions() { return this._displayedOptions; }
    public set focusedOption(option: any) {
        this._focusedOption = option;
        if (this._dropdownRef) { this._dropdownRef.instance.focusedOption = option; }
    }
    public get focusedOption() { return this._focusedOption; }

    private _dropdownRef: ComponentRef<SelectDropdownComponent>;
    private _displayedOptions: SelectOptionComponent[];
    private _focusedOption: any = null;
    private _overlayRef: OverlayRef;
    private _backDropClickSub: Subscription;

    @ViewChild("selectButton", { read: ElementRef }) private _selectButtonEl: ElementRef;
    @ViewChild("filterInput") private _filterInputEl: ElementRef;

    public get showOptions() {
        return Boolean(this._dropdownRef);
    }

    private _propagateChange: (value: any) => void;
    private _optionsMap: Map<any, SelectOptionComponent>;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private elementRef: ElementRef,
        private overlay: Overlay,
        private injector: Injector) {

    }

    public ngAfterContentInit() {
        this._computeOptions();
        this.options.changes.subscribe(() => {
            this._computeOptions();
        });
    }

    public ngOnDestroy() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }

        if (this._backDropClickSub) {
            this._backDropClickSub.unsubscribe();
        }
    }

    public writeValue(value: any): void {
        if (this.multiple) {
            this.selected = new Set(value);
        } else {
            this.selected = new Set(value ? [value] : []);
        }
        if (!this.focusedOption) {
            this.focusedOption = value;
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
            this._dropdownRef.destroy();
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
                event.stopPropagation();
                this.closeDropdown();
                this.changeDetector.markForCheck();
                return;
            default:
        }
        const index = this._moveFocusInDirection(lastIndex, direction);
        this.changeDetector.markForCheck();
        if (lastIndex !== index && this._dropdownRef) {
            this._dropdownRef.instance.scrollToIndex(index);
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

    public get title() {
        if (this.hasValueSelected) {
            const values = [...this.selected].map(x => this._optionsMap.get(x)).map(x => x && x.label).join(", ");
            return `${this.placeholder}: ${values}`;
        } else {
            return this.placeholder;
        }
    }

    public toggleDropdown() {
        if (this.showOptions) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    public openDropdown() {
        this._overlayRef = this._createOverlay();
        this._backDropClickSub = this._overlayRef.backdropClick().subscribe(() => {
            this.closeDropdown();
        });
        const injector = new SelectInjector(this, this.injector);
        const portal = new ComponentPortal(SelectDropdownComponent, null, injector);
        const ref = this._dropdownRef = this._overlayRef.attach(portal);
        ref.instance.displayedOptions = this.displayedOptions;
        ref.instance.focusedOption = this.focusedOption;
        ref.instance.multiple = this.multiple;
        ref.onDestroy(() => {
            this._dropdownRef = null;
            this._overlayRef = null;

            if (this._backDropClickSub) {
                this._backDropClickSub.unsubscribe();
                this._backDropClickSub = null;
            }
        });

        if (!this.focusedOption) {
            this.focusFirstOption();
        }
        if (this.filterable) {
            setTimeout(() => {
                this._filterInputEl.nativeElement.focus();
            });
        }
        this.changeDetector.markForCheck();
    }

    public closeDropdown() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
            this._dropdownRef = null;
        }
        setTimeout(() => {
            this._selectButtonEl.nativeElement.focus();
        });

        this.changeDetector.markForCheck();
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
            this.closeDropdown();
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
            const label = option.label && option.label.toLowerCase();
            if (!this.filter
                || label.contains(this.filter.toLowerCase())) {
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

    private _createOverlay(): OverlayRef {
        const dimensions = this.elementRef.nativeElement.getBoundingClientRect();
        const positions: ConnectionPositionPair[] = [
            {
                originX: "start",
                originY: "bottom",
                overlayX: "start",
                overlayY: "top",
                offsetX: 0,
                offsetY: 0,
            },
            {
                originX: "start",
                originY: "top",
                overlayX: "start",
                overlayY: "bottom",
                offsetX: 0,
                offsetY: 0,
            },
        ];

        const positionStrategy = this.overlay.position().connectedTo(this.elementRef,
            { originX: "start", originY: "top" },
            { overlayX: "start", overlayY: "bottom" });
        positionStrategy.withPositions(positions);
        positionStrategy.onPositionChange.subscribe((x) => {
            if (this._dropdownRef) {
                this._dropdownRef.instance.above = x.connectionPair.overlayY === "bottom";
            }
        });

        return this.overlay.create(new OverlayConfig({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            minWidth: dimensions.width,
            hasBackdrop: true,
            backdropClass: "cdk-overlay-transparent-backdrop",
        }));
    }
}
