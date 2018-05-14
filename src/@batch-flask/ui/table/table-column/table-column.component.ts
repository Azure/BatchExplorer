import {
    ChangeDetectorRef, Component, ContentChild,
    HostBinding, HostListener, Inject, Input, OnChanges, TemplateRef, forwardRef,
} from "@angular/core";

import { SecureUtils } from "@batch-flask/utils";
import { TableCellDefDirective } from "../table-cell";
import { TableColumnHeaderComponent } from "../table-column-header";
import { TableColumnRef } from "../table-column-manager";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-column",
    template: ``,
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableColumnComponent implements OnChanges {
    @Input() public defaultWidth: number = null;
    @Input() public name: string;

    @ContentChild(TableColumnHeaderComponent) public header: TableColumnHeaderComponent;
    @ContentChild(TableCellDefDirective, { read: TemplateRef }) public cell: TemplateRef<any>;

    @HostBinding("class.sortable")
    @Input()
    public sortable: boolean = false;

    @HostBinding("class.sorting")
    public isSorting: boolean = false;

    /**
     * Current column width
     */
    public width = null;

    public id: string;

    @HostBinding("class.fixed-size")
    public get fixedSize() {
        return this.width !== null;
    }

    @HostBinding("style.flex-basis")
    public get flexBasis() {
        return this.width && `${this.width}px`;
    }

    constructor(
        @Inject(forwardRef(() => TableComponent)) private _table: TableComponent,
        private changeDetector: ChangeDetectorRef) {
        this.id = SecureUtils.uuid();
    }

    public ngOnChanges(changes) {
        if (changes.defaultWidth) {
            this.width = this.defaultWidth;
            // this._table.head.updateDimensions();
        }
    }

    public update() {
        this._table.updateColumn(this.getRef());
        this.changeDetector.markForCheck();
    }

    public getRef(): TableColumnRef {
        return {
            name: this.name,
            width: this.width,
            headerContent: this.header && this.header.content,
            sortable: this.sortable,
            isSorting: this.isSorting,
            cellTemplate: this.cell,
        };
    }
}
