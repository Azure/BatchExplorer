import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

import { FileTreeNode } from "app/services/file";
import { DateUtils, prettyBytes } from "app/utils";
import "./file-table-view.scss";

@Component({
    selector: "bl-file-table-view",
    templateUrl: "file-table-view.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTableViewerComponent {
    @Input() public treeNode: FileTreeNode;
    @Input() public name: string;
    @Output() public select = new EventEmitter<FileTreeNode>();
    @Output() public back = new EventEmitter();

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

    public selectNode(path: string) {
        this.select.emit(this.treeNode.children.get(path));
    }

    public goBack() {
        this.back.emit();
    }
}
