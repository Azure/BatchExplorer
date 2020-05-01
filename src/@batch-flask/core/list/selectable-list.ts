import { ChangeDetectorRef, Directive, EventEmitter, Input, Output } from "@angular/core";
import { ListSelection } from "./list-selection";

@Directive()
// tslint:disable-next-line: directive-class-suffix
export class SelectableList {
    @Input() public set activeItem(activeItem: string | null) {
        this.selection = new ListSelection({
            keys: activeItem ? [activeItem] : [],
        });
        if (activeItem === this._activeItem) { return; }
        this._activeItem = activeItem;
        this.activeItemChange.emit(activeItem);
        this.changeDetector.markForCheck();
    }
    public get activeItem() { return this._activeItem; }

    @Output() public activeItemChange = new EventEmitter<string | null>();

    @Input() public set selection(selection: ListSelection) {
        if (selection === this._selection) { return; }
        this._selection = selection;
        this.selectionChange.emit(selection);
        this.changeDetector.markForCheck();
    }
    public get selection() { return this._selection; }

    @Output() public selectionChange = new EventEmitter<ListSelection>();

    private _activeItem: string | null;
    private _selection: ListSelection = new ListSelection();

    constructor(protected changeDetector: ChangeDetectorRef) {
    }
}
