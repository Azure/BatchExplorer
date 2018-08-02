import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { FileTreeNode } from "@batch-flask/ui/file/file-navigator";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { DropEvent, TableConfig } from "@batch-flask/ui/table";
import { DragUtils, prettyBytes } from "@batch-flask/utils";
import * as moment from "moment";
import { FileDropEvent } from "../file-explorer.component";

import "./file-table-view.scss";

@Component({
    selector: "bl-file-table-view",
    templateUrl: "file-table-view.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTableViewComponent implements OnChanges {
    @Input() public treeNode: FileTreeNode;
    @Input() public loadingStatus: LoadingStatus;
    @Input() public error: ServerError;
    @Input() public name: string;
    @Input() public canDropExternalFiles: boolean;
    @Output() public select = new EventEmitter<FileTreeNode>();
    @Output() public back = new EventEmitter();
    @Output() public dropFiles = new EventEmitter<FileDropEvent>();

    public tableConfig: TableConfig;
    public treeRows: FileTreeNode[] = [];
    public LoadingStatus = LoadingStatus;

    public ngOnChanges(changes) {
        if (changes.canDropExternalFiles) {
            this._updateTableConfig();
        }

        if (changes.treeNode) {
            this.treeRows = [...this.treeNode.walk()];
        }
    }

    public prettyFileSize(size: string) {
        // having falsy issues with contentLength = 0
        return prettyBytes(parseInt(size || "0", 10));
    }

    public prettyDate(date: Date) {
        return moment(date).format("MMM Do, YYYY, HH:mm:ss");
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

    /**
     * Called when dropping outside the table element(in the blank space)
     * @param event Drag event
     */
    public handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (!this.canDropExternalFiles) { return; }
        const files = [...event.dataTransfer.files as any];
        this.dropFiles.emit({ path: this.treeNode.path, files });
    }

    /**
     * Called when dropping on a row in the table.
     * @param event Drag event
     */
    public handleDropOnRow(event: DropEvent) {
        let node = this.treeNode.children.get(event.key);
        const data = event.data;
        if (!node.isDirectory) {
            node = this.treeNode;
        }
        const files = [...data.files as any];
        this.dropFiles.emit({ path: node.path, files });
    }

    public handleDragHover(event: DragEvent) {
        DragUtils.allowDrop(event, this.canDropExternalFiles);
    }

    public trackTreeNode(index, node: FileTreeNode) {
        return node.path;
    }

    private _updateTableConfig() {
        this.tableConfig = {
            droppable: this.canDropExternalFiles,
        };
    }
}
