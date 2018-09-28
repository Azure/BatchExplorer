import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    InjectionToken,
    Input,
    OnChanges,
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

@Component({
    selector: "bl-option",
    templateUrl: "option.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionComponent implements OnChanges, KeyNavigableListItem {
    @Input() public value: string;

    /**
     * What is searchable
     */
    @Input() public label: string;

    @Input() public useTemplate: boolean;

    @Input() public disabled: boolean;

    @ViewChild(TemplateRef) public content: TemplateRef<any>;

    constructor(
        private _element: ElementRef,
        @Inject(BL_OPTION_PARENT) private parent: OptionParent) {
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
            if (!changes.value.isFirstChange()) {
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
