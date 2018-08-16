import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener, Inject, Input, forwardRef } from "@angular/core";
import {
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowTitleDirective,
} from "../quick-list-row-def";

import { QuickListComponent } from "@batch-flask/ui/quick-list/quick-list.component";
import "./quick-list-row-render.scss";

@Component({
    selector: "bl-quick-list-row-render",
    templateUrl: "quick-list-row-render.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickListRowRenderComponent {
    @Input() public item: any;
    @Input() public titleDef: QuickListRowTitleDirective;
    @Input() public stateDef: QuickListRowStateDirective;
    @Input() public extraDef: QuickListRowExtraDirective;
    @Input() @HostBinding("class.focused") public focused: boolean;
    @Input() @HostBinding("class.selected") public selected: boolean;

    constructor(@Inject(forwardRef(() => QuickListComponent)) private list: QuickListComponent) {

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
