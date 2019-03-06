import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    InjectionToken,
    Input,
    OnChanges,
    Optional,
    SimpleChange,
    SimpleChanges,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import { KeyNavigableListItem } from "@batch-flask/core";

import "./option.scss";

export const BL_OPTION_PARENT = new InjectionToken("BL_OPTION_PARENT");

export interface OptionParent {
    optionValueChanged(change: SimpleChange);
}

/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueIdCounter = 0;

@Component({
    selector: "bl-option",
    template: "",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionComponent<TOption = any> implements OnChanges, KeyNavigableListItem {
    @Input() public readonly id: string = `bl-option-${_uniqueIdCounter++}`;

    @Input() public value: TOption;

    @Input() public item: any;

    /**
     * What is searchable
     */
    @Input() public label: string;

    @Input() public disabled: boolean;

    @ViewChild(TemplateRef) public content: TemplateRef<any>;

    constructor(
        private _element: ElementRef,
        @Optional() @Inject(BL_OPTION_PARENT) private parent: OptionParent) {
    }

    public getLabel(): string {
        if (this.label) {
            return this.label;
        } else {
            return this._readContent();
        }
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.value) {
            if (this.parent && !changes.value.isFirstChange()) {
                this.parent.optionValueChanged(changes.value);
            }
        }
    }
    private _readContent() {
        return (this._getHostElement().textContent || "").trim();
    }

    /** Gets the host DOM element. */
    private _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }
}
