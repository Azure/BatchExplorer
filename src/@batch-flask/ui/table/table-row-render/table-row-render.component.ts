import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    forwardRef,
} from "@angular/core";
import { Subscription } from "rxjs";

import { TableColumnRef } from "../table-column-manager";
import { TableComponent, TableConfig } from "../table.component";

@Component({
    selector: "bl-row-render",
    templateUrl: "table-row-render.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowRenderComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public item: any;
    @Input() public columns: TableColumnRef[];
    @Input() public tableConfig: TableConfig;
    @Input() @HostBinding("class.focused") public focused: boolean;
    @Input() @HostBinding("class.selected") public selected: boolean;

    // Aria
    @HostBinding("attr.role") public readonly role = "row";
    @HostBinding("attr.aria-selected") public get ariaSelected() {
        return this.selected;
    }

    public dimensions: number[] = [];
    public columnWidths: StringMap<number> = {};
    private _sub: Subscription;

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        private elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this.columnWidths = this.table.columnManager.getAllColumnWidth();
        this._sub = this.table.columnManager.dimensionsChange.subscribe(() => {
            this.columnWidths = this.table.columnManager.getAllColumnWidth();
            this.changeDetector.markForCheck();
        });
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

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @HostListener("click", ["$event"])
    public handleClick(event: MouseEvent, activate = true) {
        this.table.handleClick(event, this.item, activate);
    }

    @HostListener("contextmenu")
    public openContextMenu() {
        this.table.openContextMenu(this);
    }

    public get id() {
        return this.item.id;
    }

    public trackColumn(index: number, column: TableColumnRef) {
        return column.name;
    }
}
