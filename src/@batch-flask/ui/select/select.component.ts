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

    public selected = new Set<any>();
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

    @ViewChild("selectButton", { read: ElementRef }) private _selectButtonEl: ElementRef;
    @ViewChild("filterInput") private _filterInputEl: ElementRef;

    public get showOptions() {
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
    }

    public ngAfterContentInit() {
        this._initKeyNavigator();
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

    public clickSelectButton(event: Event) {
        if (this.disabled) { return; }
        this.toggleDropdown();
        event.stopPropagation();
    }

    @HostListener("keydown", ["$event"])
    public handleKeyDown(event: KeyboardEvent) {
        if (this.disabled) { return; }
        this.showOptions ? this._handleKeydownOpen(event) : this._handleKeyDownClosed(event);
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
        this.focusedOption = option;
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
        if (this.displayedOptions.length === 0) {
            return;
        }
        this.focusedOption = this.displayedOptions.first();
        this.changeDetector.markForCheck();
    }

    public setDescribedByIds(ids: string[]) {
        this.ariaDescribedby = ids.join(" ");
    }

    public onContainerClick(event: Event) {
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

                if (this.focusedOption && option.value === this.focusedOption.value) {
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
        let direction = null;
        const focusedValue = this._focusedOption && this._focusedOption.value;
        const lastIndex = this.displayedOptions.findIndex(x => x.value === focusedValue);
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
            case "Space":
                if (!this.filterable) {
                    this.selectOption(option);
                    event.preventDefault();
                    return;
                }
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

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private _initKeyNavigator() {
        this._keyNavigator = new ListKeyNavigator<SelectOptionComponent>()
            .withWrap();
        // .withTypeAhead()
        // .withVerticalOrientation()
        // .withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');

        // this._keyNavigator.tabOut.pipe(takeUntil(this._destroy)).subscribe(() => {
        //     // Restore focus to the trigger before closing. Ensures that the focus
        //     // position won't be lost if the user got focus into the overlay.
        //     this.focus();
        //     this.close();
        // });

        this._keyNavigator.change.subscribe((index) => {
            console.log("Cjange,", index);
            const option = this.focusedOption = this.displayedOptions[index];
            this.changeDetector.markForCheck();

            if (this.showOptions) {
                this._dropdownRef.instance.scrollToIndex(index);
            } else if (!this.showOptions && !this.multiple) {
                this.selectOption(option);
            }
        });
    }

}
