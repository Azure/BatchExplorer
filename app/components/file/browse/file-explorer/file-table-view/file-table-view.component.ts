import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";

import { LoadingStatus } from "app/components/base/loading";
import { DropEvent, TableConfig } from "app/components/base/table";
import { ServerError } from "app/models";
import { FileTreeNode } from "app/services/file";
import { DateUtils, prettyBytes } from "app/utils";
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
    @Input() public dropable: boolean;
    @Output() public select = new EventEmitter<FileTreeNode>();
    @Output() public back = new EventEmitter();
    @Output() public dropFiles = new EventEmitter<FileDropEvent>();

    public tableConfig: TableConfig;

    public LoadingStatus = LoadingStatus;

    public ngOnChanges(inputs) {
        if (inputs.dropable) {
            this._updateTableConfig();
        }
    }

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

    public handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const files = [...event.dataTransfer.files as any];
        this.dropFiles.emit({ path: this.treeNode.path, files });
    }

    public handleDropOnRow(event: DropEvent) {
        let node = this.treeNode.children.get(event.key);
        const data = event.data;
        if (!node.isDirectory) {
            node = this.treeNode;
        }
        const files = [...data.files as any];
        this.dropFiles.emit({ path: node.path, files });
    }

    private _updateTableConfig() {
        this.tableConfig = {
            droppable: true,
        };
    }
}
