import {
    AfterViewInit, ChangeDetectionStrategy,
    ChangeDetectorRef, Component, Inject, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";

import { TableColumnComponent } from "../table-column";

@Component({
    selector: "bl-column-header",
    templateUrl: "table-column-header.html",
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableColumnHeaderComponent implements AfterViewInit {
    @ViewChild(TemplateRef) public content: TemplateRef<any>;

    constructor(
        @Inject(forwardRef(() => TableColumnComponent)) public column: TableColumnComponent,
        private changeDetector: ChangeDetectorRef) {

    }

    public ngAfterViewInit() {
        this.column.update();
    }
}
