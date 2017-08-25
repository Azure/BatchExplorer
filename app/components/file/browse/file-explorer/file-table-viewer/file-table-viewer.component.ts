import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

import { FileTreeNode } from "app/services/file";
import { DateUtils, prettyBytes } from "app/utils";
import "./file-table-viewer.scss";

@Component({
    selector: "bl-file-table-viewer",
    templateUrl: "file-table-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTableViewerComponent {
    @Input() public treeNode: FileTreeNode;
    @Output() public pathChange = new EventEmitter<string>();

    public prettyFileSize(size: string) {
        // having falsy issues with contentLength = 0
        return prettyBytes(parseInt(size || "0", 10));
    }

    public prettyDate(date: Date) {
        return DateUtils.customFormat(date, "MMM Do, YYYY, HH:mm:ss");
    }

    public isErrorState(file: any) {
        return false;
    }

    public updateActiveItem(path: string) {
        this.pathChange.emit(path);
    }
}
