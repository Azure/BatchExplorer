import {
    AfterContentInit, ChangeDetectionStrategy,
    ChangeDetectorRef, Component,
    ContentChild, HostBinding,
    Inject, Input, OnChanges,
    OnInit, SimpleChanges, TemplateRef,
    forwardRef,
} from "@angular/core";

import { SecureUtils } from "@batch-flask/utils";
import { TableCellDefDirective } from "../table-cell-def";
import { TableColumnRef } from "../table-column-manager";
import { TableHeadCellDefDirective } from "../table-head-cell-def";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-column",
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableColumnComponent implements OnInit, AfterContentInit, OnChanges {
    @Input() public defaultWidth: number = null;
    @Input() public name: string;

    @ContentChild(TableHeadCellDefDirective, { read: TemplateRef }) public headCell: TemplateRef<any>;
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

    public ngOnInit() {
        this._validateName();
    }

    public ngAfterContentInit() {
        this._validateCellDef();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.name) {
            this._validateName();
        }
        if (changes.defaultWidth) {
            this.width = this.defaultWidth;
        }
    }

    public update() {
        this._table.updateColumn(this.name, this.getRef());
        this.changeDetector.markForCheck();
    }

    public getRef(): TableColumnRef {
        return {
            name: this.name,
            width: this.width,
            headCellTemplate: this.headCell,
            sortable: this.sortable,
            isSorting: this.isSorting,
            cellTemplate: this.cell,
        };
    }

    private _validateName() {
        if (!this.name) {
            throw new Error("bl-column must have a unique name but not was provided.");
        }
    }

    private _validateCellDef() {
        if (!this.cell) {
            const example = `<div *blCellDef="let item">item.value</div>`;
            throw new Error(`bl-column '${this.name}' must have a cell definition. Add '${example}'`);
        }
    }
}
