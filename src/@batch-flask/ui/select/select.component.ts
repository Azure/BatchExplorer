import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Injector,
    Input,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    Self,
    ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

import { SelectOptionComponent } from "./option";

import { DOWN_ARROW, END, ENTER, ESCAPE, HOME, SPACE, UP_ARROW } from "@angular/cdk/keycodes";
import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { FlagInput, ListKeyNavigator, coerceBooleanProperty } from "@batch-flask/core";
import { FormFieldControl } from "@batch-flask/ui/form/form-field";
import { SelectDropdownComponent } from "@batch-flask/ui/select/select-dropdown";
import { Subject, Subscription } from "rxjs";
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

let nextUniqueId = 0;

@Component({
    selector: "bl-select",
    templateUrl: "select.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: FormFieldControl, useExisting: SelectComponent }],
})
export class SelectComponent implements FormFieldControl<any>, ControlValueAccessor, AfterContentInit, OnDestroy {
    @Input() public placeholder = "";

    /**
     * If the select accepts multiple values
     */
    @Input() @FlagInput() public multiple = false;

    /**
     * If there select include a search box
     */
    @Input() @FlagInput() public filterable = false;

    @Input()
    get id(): string { return this._id; }
    set id(value: string) { this._id = value || this._uid; }

    @Input() @FlagInput() public required = false;

    @Input()
    @HostBinding("class.bl-disabled")
    public get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    @Output() public change = new EventEmitter<any | any[]>();

    @HostBinding("attr.aria-describedby")
    public ariaDescribedby: string;

    @ContentChildren(SelectOptionComponent)
    public options: QueryList<SelectOptionComponent>;

    public filter: string = "";

    public set displayedOptions(displayedOptions: SelectOptionComponent[]) {
        this._displayedOptions = displayedOptions;
        if (this._dropdownRef) { this._dropdownRef.instance.displayedOptions = displayedOptions; }
        this._keyNavigator.items = displayedOptions;
    }
    public get displayedOptions() { return this._displayedOptions; }

    public set focusedOption(option: SelectOptionComponent) {
        this._focusedOption = option;
        if (this._dropdownRef) { this._dropdownRef.instance.focusedOption = option; }
    }
    public get focusedOption() { return this._focusedOption; }

    public set selected(selection: Set<any>) {
        this._selected = selection;
        if (this._dropdownRef) { this._dropdownRef.instance.selected = selection; }
    }
    public get selected() { return this._selected; }

    public readonly stateChanges = new Subject<void>();
    public readonly controlType: string = "bl-select";

    private _dropdownRef: ComponentRef<SelectDropdownComponent>;
    private _displayedOptions: SelectOptionComponent[];
    private _focusedOption: SelectOptionComponent = null;
    private _overlayRef: OverlayRef;
    private _backDropClickSub: Subscription;
    private _id: string;
    private _uid = `bl-select-${nextUniqueId++}`;
    private _disabled = false;
    private _keyNavigator: ListKeyNavigator<SelectOptionComponent>;
    private _selected: Set<any> = new Set<any>();

    @ViewChild("selectButton", { read: ElementRef }) private _selectButtonEl: ElementRef;
    @ViewChild("filterInput") private _filterInputEl: ElementRef;

    public get dropdownOpen() {
        return Boolean(this._dropdownRef);
    }

    @Input()
    public get value(): any | any[] {
        if (this.multiple) {
            return [...this.selected];
        } else {
            return [...this.selected].first();
        }
    }
    public set value(value: any | any[]) {
        if (value !== this.value) {
            this.writeValue(value);
            this.stateChanges.next();
        }
    }

    private _propagateChange: (value: any) => void;
    private _optionsMap: Map<any, SelectOptionComponent>;

    constructor(
        @Self() @Optional() public ngControl: NgControl,
        private changeDetector: ChangeDetectorRef,
        private elementRef: ElementRef,
        private overlay: Overlay,
        private injector: Injector) {

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        this._initKeyNavigator();
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

        if (this._keyNavigator) {
            this._keyNavigator.dispose();
        }
    }

    public writeValue(value: any): void {
        if (Array.isArray(value)) {
            this.selected = new Set(value);
        } else {
            this.selected = new Set(value ? [value] : []);
        }
        if (!this._keyNavigator.focusedItem) {
            const option = this._getOptionByValue(value);
            if (option) {
                this._keyNavigator.focusItem(option);
            }
        }

        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // nothing yet
    }

    public clickSelectButton(event: Event) {
        if (this.disabled) { return; }
        this.toggleDropdown();
        event.stopPropagation();
    }

    @HostListener("keydown", ["$event"])
    public handleKeyDown(event: KeyboardEvent) {
        if (this.disabled) { return; }
        this.dropdownOpen ? this._handleKeydownOpen(event) : this._handleKeyDownClosed(event);
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
        if (this.dropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    public openDropdown() {
        if (this.filterable) { // Disable type ahead as there is a search bar when filterable is enabled
            this._keyNavigator.disableTypeAhead();
        }

        this._overlayRef = this._createOverlay();
        this._backDropClickSub = this._overlayRef.backdropClick().subscribe(() => {
            this.closeDropdown();
        });
        const injector = new SelectInjector(this, this.injector);
        const portal = new ComponentPortal(SelectDropdownComponent, null, injector);
        const ref = this._dropdownRef = this._overlayRef.attach(portal);
        ref.instance.displayedOptions = this.displayedOptions;
        ref.instance.focusedOption = this.focusedOption;
        ref.instance.selected = this.selected;
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
        if (!this.dropdownOpen) { return; }
        if (this.filterable) {
            this._keyNavigator.withTypeAhead(); // Reenable typeAhead as it was disabled when dropdown is open
        }
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

    public selectOption(option: SelectOptionComponent | null) {
        this._keyNavigator.focusItem(option);

        if (this.multiple) {
            if (option) {
                if (this.selected.has(option.value)) {
                    this.selected.delete(option.value);
                } else {
                    this.selected.add(option.value);
                }
            }
        } else {
            if (option) {
                this.selected = new Set([option.value]);
            } else {
                this.selected = new Set([]);
            }
            this.closeDropdown();
        }
        this.notifyChanges();
        this.changeDetector.markForCheck();
    }

    public unselectAll() {
        this.selected.clear();
        this.notifyChanges();
        this.changeDetector.markForCheck();
    }

    public notifyChanges() {
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
        this.change.emit(this.value);
    }

    public filterChanged(filter: string) {
        this.filter = filter;
        this._computeDisplayedOptions();
    }

    public focusFirstOption() {
        this._keyNavigator.focusFirstItem();
    }

    public setDescribedByIds(ids: string[]) {
        this.ariaDescribedby = ids.join(" ");
    }

    public onContainerClick(event: Event) {
        this._selectButtonEl.nativeElement.focus();
        this.clickSelectButton(event);
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

                if (option === this.focusedOption) {
                    focusedOptionIncluded = true;
                }
            }
        });
        this.displayedOptions = options;

        // If the filter makes it that we don't see the currently focusesd option fallback to focussing the first item
        if (!focusedOptionIncluded && this.dropdownOpen && this.filterable && this.filter) {
            this.focusFirstOption();
        }
        this.changeDetector.markForCheck();
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

    private _handleKeyDownClosed(event: KeyboardEvent) {
        const keyCode = event.code;
        const isArrowKey = keyCode === "ArrowDown" || keyCode === "ArrowUp" ||
            keyCode === "ArrowLeft" || keyCode === "ArrowRight";
        const isOpenKey = keyCode === "Enter" || keyCode === "Space";
        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || ((this.multiple || event.altKey) && isArrowKey)) {
            event.preventDefault(); // prevents the page from scrolling down when pressing space
            this.openDropdown();
        } else {
            this._keyNavigator.onKeydown(event);
        }
    }

    private _handleKeydownOpen(event: KeyboardEvent) {
        if (this.displayedOptions.length === 0) { return; }

        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;

        const navigator = this._keyNavigator;
        if (keyCode === HOME || keyCode === END) {
            event.preventDefault();
            keyCode === HOME ? navigator.focusFirstItem() : navigator.focusLastItem();
        } else if (isArrowKey && event.altKey || keyCode === ESCAPE) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();
            this.closeDropdown();
        } else if ((keyCode === ENTER || keyCode === SPACE) && navigator.focusedItem) {
            event.preventDefault();
            this.selectOption(navigator.focusedItem);
        } else {
            const previouslyFocusedIndex = navigator.focusedItemIndex;

            navigator.onKeydown(event);

            if (this.multiple && isArrowKey && event.shiftKey && navigator.focusedItem &&
                navigator.focusedItemIndex !== previouslyFocusedIndex) {
                this.selectOption(navigator.focusedItem);
            }
        }
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private _initKeyNavigator() {
        this._keyNavigator = new ListKeyNavigator<SelectOptionComponent>()
            .withWrap()
            .withTypeAhead();

        this._keyNavigator.change.subscribe((index) => {
            const option = this.focusedOption = this._keyNavigator.focusedItem;
            this.changeDetector.markForCheck();

            if (this.dropdownOpen) {
                this._scrollToFocusedItem();
            } else if (!this.dropdownOpen && !this.multiple) {
                this.selectOption(option);
            }
        });
    }

    private _getOptionByValue(value: any) {
        return this.displayedOptions && this.displayedOptions.find(x => x.value === value);
    }

    private _scrollToFocusedItem() {
        this._dropdownRef.instance.scrollToIndex(this._keyNavigator.focusedItemIndex);
    }
}
