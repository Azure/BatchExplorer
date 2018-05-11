import {
    ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild, Directive,
} from "@angular/core";

@Component({
    selector: "bl-cell",
    templateUrl: "table-cell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCellComponent {
    /**
     * Specify the value here if its different from the content
     */
    @Input() public value: string;
    @Input() public class: string;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}

@Directive({
    selector: "[blCellDef]",
})
export class TableCellDefDirective {
}
