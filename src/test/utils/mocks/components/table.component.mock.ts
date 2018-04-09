import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-table",
    template: "<ng-content></ng-content>",
})
export class TableMockComponent {
    @Input()
    public activeItem: string;
}

@Component({
    selector: "bl-cell",
    template: "{{value}}<ng-content></ng-content>",
})
export class TableCellMockComponent {
    @Input() public value: string;
}
