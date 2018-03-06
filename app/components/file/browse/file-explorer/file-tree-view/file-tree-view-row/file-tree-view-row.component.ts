import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";

import "./file-tree-view-row.scss";

@Component({
    selector: "bl-file-tree-view-row",
    templateUrl: "file-tree-view-row.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTreeViewRowComponent {
    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
