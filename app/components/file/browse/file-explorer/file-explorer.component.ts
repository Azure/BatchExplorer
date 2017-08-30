import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from "@angular/core";
import { Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { FileNavigator, FileTreeNode } from "app/services/file";
import "./file-explorer.scss";

export interface FileNavigatorEntry {
    name: string;
    navigator: FileNavigator;
}

export enum FileExplorerSelectable {
    none = 1,
    file = 2,
    folder = 4,
    all = 6,
}

export interface FileDropEvent {
    path: string;
    files: File[];
}

export interface FileExplorerConfig {
    /**
     * If the file explorer should show the tree view on the left
     * @default true
     */
    showTreeView?: boolean;

    /**
     * If the explorer should just select the file(not open)
     * @default FileExplorerSelectable.none
     */
    selectable?: FileExplorerSelectable;

    /**
     * If the explorer allows dropping external files
     * @default false
     */
    canDropExternalFiles?: boolean;
}

const fileExplorerDefaultConfig: FileExplorerConfig = {
    showTreeView: true,
    selectable: FileExplorerSelectable.none,
    canDropExternalFiles: false,
};

/**
 * File explorer is a combination of the tree view and the file preview.
 */
@Component({
    selector: "bl-file-explorer",
    templateUrl: "file-explorer.html",
})
export class FileExplorerComponent implements OnChanges, OnDestroy {
    @Input() public fileNavigator: FileNavigator;
    @Input() public fileNavigators: FileNavigatorEntry[];
    @Input() public autoExpand = false;
    @Input() public activeFile: string;
    @Input() public set config(config: FileExplorerConfig) {
        this._config = { ...fileExplorerDefaultConfig, ...config };
    }
    public get config() { return this._config; }
    @Output() public activeFileChange = new EventEmitter<string>();
    @Output() public dropFiles = new EventEmitter<FileDropEvent>();

    public LoadingStatus = LoadingStatus;
    public currentNode: FileTreeNode;
    public currentFileNavigator: FileNavigator;
    public currentFileNavigatorEntry: FileNavigatorEntry;

    private _currentNodeSub: Subscription;

    private _config: FileExplorerConfig = fileExplorerDefaultConfig;

    public ngOnChanges(inputs) {
        if (inputs.fileNavigator) {
            this.fileNavigators = [{ name: "Files", navigator: this.fileNavigator }];
        }
        if (inputs.fileNavigator || inputs.fileNavigators) {
            this.updateCurrentNavigator(this.fileNavigators.first());
        }
    }

    public ngOnDestroy() {
        this._clearCurrentNodeSub();
    }

    public nodeSelected(node: FileTreeNode) {
        // tslint:disable-next-line:no-bitwise
        if (node.isDirectory && (this.config.selectable & FileExplorerSelectable.folder)) {
            this.activeFileChange.emit(node.path);
            // tslint:disable-next-line:no-bitwise
        } else if (!node.isDirectory && (this.config.selectable & FileExplorerSelectable.file)) {
            this.activeFileChange.emit(node.path);
        } else {
            this.navigateTo(node.path);
        }
    }

    public navigateTo(path: string) {
        this.currentFileNavigator.navigateTo(path);
    }

    public updateCurrentNavigator(entry: FileNavigatorEntry) {
        this.currentFileNavigatorEntry = entry;
        this.currentFileNavigator = entry.navigator;
        this._updateNavigatorEvents();
    }

    public goBack() {
        this.currentFileNavigator.goBack();
    }

    public handleDrop(event: FileDropEvent) {
        this.dropFiles.emit(event);
    }

    private _updateNavigatorEvents() {
        this._clearCurrentNodeSub();
        this._currentNodeSub = this.currentFileNavigator.currentNode.subscribe((node) => {
            this.currentNode = node;
        });
    }

    private _clearCurrentNodeSub() {
        if (this._currentNodeSub) {
            this._currentNodeSub.unsubscribe();
        }
    }
}
