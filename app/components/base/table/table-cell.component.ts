import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-cell",
    template: `
        <div *ngIf="value" class="cell-value" title="{{value}}">{{value}}</div>
        <ng-content *ngIf="!value"></ng-content>
    `,
})
export class TableCellComponent {
    @Input()
    public set value(value: string) {
        this._value = value;
    }
    public get value() {
        return this._value;
    }

    private _value: string;
}
