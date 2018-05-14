import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    TemplateRef,
    ViewChild,
} from "@angular/core";

@Component({
    selector: "bl-header-cell-def",
    templateUrl: "table-header-cell-def.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderCellDefComponent {
    @ViewChild(TemplateRef) public content: TemplateRef<any>;

    constructor(private changeDetector: ChangeDetectorRef) {
    }
}
