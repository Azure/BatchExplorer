import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity";
import { DialogService } from "@batch-flask/ui/dialogs";
import { FileNavigator, FileTreeNode } from "@batch-flask/ui/file/file-navigator";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { SplitPaneConfig } from "@batch-flask/ui/split-pane";
import { CloudPathUtils, FileUrlUtils } from "@batch-flask/utils";
import * as path from "path";
import { Subscription, of } from "rxjs";
import { CurrentNode, FileExplorerWorkspace, FileSource, OpenedFile } from "./file-explorer-workspace";

import { FileSystemService } from "@batch-flask/electron";
import { FileViewerConfig } from "../file-viewer";
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
    navigator: FileNavigator;
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

    viewer?: FileViewerConfig;
}

const fileExplorerDefaultConfig: FileExplorerConfig = {
    showTreeView: true,
    selectable: FileExplorerSelectable.none,
    canDropExternalFiles: false,
    viewer: null,
};

/**
 * File explorer is a combination of the tree view and the file preview.
 */
@Component({
    selector: "bl-file-explorer",
    templateUrl: "file-explorer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    @Input() public set config(config: FileExplorerConfig) {
        this._config = { ...fileExplorerDefaultConfig, ...config };
    }
    public get config() { return this._config; }
    @Input() public autoExpand = false;
    @Input() public activeFile: string;
    @Output() public activeFileChange = new EventEmitter<string>();
    @Output() public dropFiles = new EventEmitter<FileDropEvent>();

    public LoadingStatus = LoadingStatus;
    public currentSource: FileSource;
    public currentNode: CurrentNode;
    public workspace: FileExplorerWorkspace;

    public splitPaneConfig: SplitPaneConfig;

    private _workspaceSubs: Subscription[] = [];
    private _config: FileExplorerConfig = fileExplorerDefaultConfig;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private dialogService: DialogService,
        private fs: FileSystemService,
        private activityService: ActivityService) {
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
        if (!this._updateActiveItem(node)) {
            this.navigateTo(node.path, this.currentSource);
        }
    }

    public navigateTo(path: string, source: FileSource) {
        this.workspace.navigateTo(path, source);
        source.navigator.getNode(path).subscribe((node) => {
            this._updateActiveItem(node);
        });
    }

    public goBack() {
        this.workspace.goBack();
    }

    public handleDrop(event: FileDropEvent) {
        this.dialogService.confirm(`Upload files`, {
            description: `Files will be uploaded to /${event.path}`,
            yes: () => {
                this._uploadFiles(event);

                return of(null);
            },
        });
    }

    public trackSource(index, source: FileSource) {
        return source.name;
    }

    public trackOpenedFile(index, file: OpenedFile) {
        return `${file.source.name}/${file.path}`;
    }

    public handleDelete(event: FileDeleteEvent) {
        const { path } = event;
        const description = event.isDirectory
            ? `All files will be deleted from the folder: ${path}`
            : `The file '${FileUrlUtils.getFileName(path)}' will be deleted.`;
        this.dialogService.confirm(`Delete files`, {
            description: description,
            yes: () => {
                if (event.isDirectory) {
                    const name = `Deleting folder ${event.path}`;

                    // get the initializer for a folder deletion activity from the FileNavigator
                    const initializer = () => {
                        return event.navigator.createFolderDeletionActivityInitializer(event.path);
                    };

                    // create a folder deletion activity, and run it
                    const activity = new Activity(name, initializer);
                    this.activityService.exec(activity);
                } else {
                    const name = `Deleting file ${event.path}`;

                    // if the event is not a directory, create a simple file deletion activity
                    const initializer = () => {
                        return event.navigator.deleteFile(event.path);
                    };

                    // run the activity
                    const activity = new Activity(name, initializer);
                    this.activityService.exec(activity);
                }
            },
        });
    }

    private _updateActiveItem(node: FileTreeNode): boolean {
        // tslint:disable-next-line:no-bitwise
        if (node.isDirectory && (this.config.selectable & FileExplorerSelectable.folder)) {
            this.activeFileChange.emit(node.path);
            return true;
            // tslint:disable-next-line:no-bitwise
        } else if (!node.isDirectory && (this.config.selectable & FileExplorerSelectable.file)) {
            this.activeFileChange.emit(node.path);
            return true;

        }
        return false;
    }

    private _updateWorkspaceEvents() {
        this._clearWorkspaceSubs();
        this._workspaceSubs.push(this.workspace.currentSource.subscribe((source) => {
            this.currentSource = source;
            this.changeDetector.markForCheck();
        }));

        this._workspaceSubs.push(this.workspace.currentNode.subscribe((node) => {
            this.currentNode = { ...node, treeNode: new FileTreeNode(node.treeNode) } as any;
            this.changeDetector.markForCheck();
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
        this.changeDetector.markForCheck();
    }

    private async _getFilesToUpload(base: string, files: any[]) {
        const result = [];
        for (const file of files) {
            const stats = await this.fs.lstat(file.path);
            const filename = path.basename(file.path);
            if (stats.isFile()) {
                result.push({ localPath: file.path, remotePath: CloudPathUtils.join(base, filename) });
            } else {

                const dirFiles = await this.fs.readdir(file.path);
                for (const dirFile of dirFiles) {
                    result.push({
                        localPath: path.join(file.path, dirFile),
                        remotePath: CloudPathUtils.join(base, CloudPathUtils.normalize(dirFile)),
                    });
                }
            }
        }
        return result;
    }

    private _createUploadActivities(files: any[]) {
        return files.map((file) => {
            const filename = path.basename(file.localPath);
            const activity = new Activity(`Uploading ${filename}`, () => {
                return this.currentSource.navigator.uploadFile(file.remotePath, file.localPath);
            });
            activity.done.subscribe(() => this.currentSource.navigator.loadFile(file.remotePath).subscribe());
            return activity;
        });
    }

    private async _uploadFiles(event: FileDropEvent) {
        const files = await this._getFilesToUpload(event.path, event.files);
        const activities = this._createUploadActivities(files);

        const name = `Uploading ${files.length} files`;
        const activity = new Activity(name, () => of(activities));
        this.activityService.exec(activity);
    }
}
