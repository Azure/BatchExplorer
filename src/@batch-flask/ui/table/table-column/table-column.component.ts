import {
    AfterContentInit, ChangeDetectionStrategy,
    ChangeDetectorRef, Component,
    ContentChild,
    Inject, Input, OnChanges,
    OnInit, SimpleChanges, TemplateRef,
    forwardRef,
} from "@angular/core";
import { SanitizedError } from "@batch-flask/utils";
import { TableCellDefDirective } from "../table-cell-def";
import { TableColumnRef } from "../table-column-manager";
import { TableHeadCellDefDirective } from "../table-head-cell-def";
import { TableComponent } from "../table.component";

let idCounter = 0;

@Component({
    selector: "bl-column",
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableColumnComponent implements OnInit, AfterContentInit, OnChanges {
    @Input() public id = `bl-column-${idCounter++}`;

    @Input() public defaultWidth: number = null;
    /**
     * What should be the minimum width of the column
     */
    @Input() public minWidth: number = 30;
    @Input() public maxWidth: number = null;
    @Input() public name: string;

    @ContentChild(TableHeadCellDefDirective, { read: TemplateRef, static: false})
    public headCell: TemplateRef<any>;
    @ContentChild(TableCellDefDirective, { read: TemplateRef, static: false })
    public cell: TemplateRef<any>;

    @Input()
    public sortable: boolean = false;

    constructor(
        @Inject(forwardRef(() => TableComponent)) private _table: any,
        private changeDetector: ChangeDetectorRef) {
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
    }

    public update() {
        this._table.updateColumn(this.name, this.getRef());
        this.changeDetector.markForCheck();
    }

    public getRef(): TableColumnRef {
        return {
            id: this.id,
            name: this.name,
            defaultWidth: this.defaultWidth,
            minWidth: this.minWidth,
            maxWidth: this.maxWidth,
            headCellTemplate: this.headCell,
            sortable: this.sortable,
            cellTemplate: this.cell,
        };
    }

    private _validateName() {
        if (!this.name) {
            throw new SanitizedError("bl-column must have a unique name but not was provided.");
        }
    }

    private _validateCellDef() {
        if (!this.cell) {
            const example = `<div *blCellDef="let item">item.value</div>`;
            throw new SanitizedError(`bl-column '${this.name}' must have a cell definition. Add '${example}'`);
        }
    }
}
