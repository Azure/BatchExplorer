import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnChanges,
    forwardRef,
} from "@angular/core";
import { QuickListComponent } from "@batch-flask/ui/quick-list/quick-list.component";
import {
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
} from "../quick-list-row-def";

import "./quick-list-row-render.scss";

@Component({
    selector: "bl-quick-list-row-render",
    templateUrl: "quick-list-row-render.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickListRowRenderComponent implements OnChanges {
    @Input() public item: any;
    @Input() public titleDef: QuickListRowTitleDirective;
    @Input() public stateDef: QuickListRowStateDirective;
    @Input() public extraDef: QuickListRowExtraDirective;
    @Input() public statusDef: QuickListRowStatusDirective;
    @Input() @HostBinding("class.focused") public focused: boolean;
    @Input() @HostBinding("class.selected") public selected: boolean;

    // Aria
    @HostBinding("attr.role") public readonly role = "option";
    @HostBinding("attr.aria-selected") public get ariaSelected() {
        return this.selected;
    }
    @HostBinding("attr.aria-setsize") public get ariaSetSize() {
        return this.list.items.length;
    }

    constructor(
        @Inject(forwardRef(() => QuickListComponent)) private list: QuickListComponent,
        private elementRef: ElementRef) {

    }

    public ngOnChanges(changes) {
        if (changes.focused) {
            if (this.focused) {
                setTimeout(() => {
                    // Check it is still focused. Might have focused out already
                    if (this.focused) {
                        this.elementRef.nativeElement.focus();
                    }
                });
            }
        }
    }

    @HostListener("click", ["$event"])
    public handleClick(event: MouseEvent, activate = true) {
        this.list.handleClick(event, this.item, activate);
    }

    @HostListener("contextmenu")
    public openContextMenu() {
        this.list.openContextMenu(this);
    }

    public get id() {
        return this.item.id;
    }
}
