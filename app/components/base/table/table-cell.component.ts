import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bl-cell",
    templateUrl: "table-cell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCellComponent {
    @Input()
    public set value(value: string) {
        this._value = value;
    }
    public get value() {
        return this._value;
    }

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    private _value: string;
}
