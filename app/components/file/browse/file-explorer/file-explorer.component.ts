import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from "@angular/core";
import { Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { SplitPaneConfig } from "app/components/base/split-pane";
import { CurrentNode, FileExplorerWorkspace, FileSource, OpenedFile } from "app/components/file/browse/file-explorer";
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

export interface FileDeleteEvent {
    path: string;
    isDirectory: boolean;
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

    /**
     * If the explorer allows deleting external files
     * @default false
     */
    canDeleteFiles?: boolean;

    /**
     * If log file can be automatically refreshed(Tail)
     */
    tailable?: boolean;
}

const fileExplorerDefaultConfig: FileExplorerConfig = {
    showTreeView: true,
    selectable: FileExplorerSelectable.none,
    canDropExternalFiles: false,
    canDeleteFiles: false,
    tailable: false,
};

/**
 * File explorer is a combination of the tree view and the file preview.
 */
@Component({
    selector: "bl-file-explorer",
    templateUrl: "file-explorer.html",
})
export class FileExplorerComponent implements OnChanges, OnDestroy {
    @Input() public set data(data: FileExplorerWorkspace | FileNavigator) {
        if (data instanceof FileExplorerWorkspace) {
            this.workspace = data;
        } else {
            this.workspace = new FileExplorerWorkspace(data);
        }
        this._updateWorkspaceEvents();
    }
    @Input() public autoExpand = false;
    @Input() public activeFile: string;
    @Input() public set config(config: FileExplorerConfig) {
        this._config = { ...fileExplorerDefaultConfig, ...config };
    }
    public get config() { return this._config; }
    @Output() public activeFileChange = new EventEmitter<string>();
    @Output() public dropFiles = new EventEmitter<FileDropEvent>();
    @Output() public deleteFiles = new EventEmitter<FileDeleteEvent>();

    public LoadingStatus = LoadingStatus;
    public currentSource: FileSource;
    public currentNode: CurrentNode;
    public workspace: FileExplorerWorkspace;

    public splitPaneConfig: SplitPaneConfig;

    private _workspaceSubs: Subscription[] = [];
    private _config: FileExplorerConfig = fileExplorerDefaultConfig;

    constructor() {
        this._updateSplitPanelConfig();
    }

    public ngOnChanges(inputs) {
        // Todo Remove?
        if (inputs.config) {
            this._updateSplitPanelConfig();
        }
    }

    public ngOnDestroy() {
        this._clearWorkspaceSubs();
    }

    /**
     * Triggered when a file/folder is selected in the table view
     * It will either navigate to the given item or select it depending on the settings.
     * @param node Tree node that got selected
     */
    public nodeSelected(node: FileTreeNode) {
        // tslint:disable-next-line:no-bitwise
        if (node.isDirectory && (this.config.selectable & FileExplorerSelectable.folder)) {
            this.activeFileChange.emit(node.path);
            // tslint:disable-next-line:no-bitwise
        } else if (!node.isDirectory && (this.config.selectable & FileExplorerSelectable.file)) {
            this.activeFileChange.emit(node.path);
        } else {
            this.navigateTo(node.path, this.currentSource);
        }
    }

    public navigateTo(path: string, source: FileSource) {
        this.workspace.navigateTo(path, source);
    }

    public goBack() {
        this.workspace.goBack();
    }

    public handleDrop(event: FileDropEvent) {
        this.dropFiles.emit(event);
    }

    public handleDelete(event: FileDeleteEvent) {
        this.deleteFiles.emit(event);
    }

    public trackSource(index, source: FileSource) {
        return source.name;
    }

    public trackOpenedFile(index, file: OpenedFile) {
        return `${file.source.name}/${file.path}`;
    }

    private _updateWorkspaceEvents() {
        this._clearWorkspaceSubs();
        this._workspaceSubs.push(this.workspace.currentNode.subscribe((node) => {
            this.currentNode = node;
        }));
        this._workspaceSubs.push(this.workspace.currentSource.subscribe((source) => {
            this.currentSource = source;
        }));
    }

    private _clearWorkspaceSubs() {
        this._workspaceSubs.forEach(x => x.unsubscribe());
        this._workspaceSubs = [];
    }

    private _updateSplitPanelConfig() {
        this.splitPaneConfig = {
            firstPane: {
                minSize: 200,
                hidden: !this.config.showTreeView,
            },
            secondPane: {
                minSize: 300,
            },
            initialDividerPosition: 250,
        };
    }
}
