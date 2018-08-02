import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";

import "./file-dialog.scss";

@Component({
    selector: "bl-file-dialog",
    templateUrl: "file-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDialogComponent {
    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
