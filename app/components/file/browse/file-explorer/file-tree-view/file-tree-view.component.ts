import { Component, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output } from "@angular/core";
import { Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "app/components/base/context-menu";
import { FileNavigator, FileTreeNode, FileTreeStructure } from "app/services/file";
import { CloudPathUtils, DragUtils } from "app/utils";
import { FileDeleteEvent, FileDropEvent } from "../file-explorer.component";

import { ActivatedRoute } from "@angular/router";
import { DialogService } from "app/components/base/dialogs";
import { NotificationService } from "app/components/base/notifications";
import { ServerError } from "app/models";
import { ElectronShell } from "app/services";
import { remote } from "electron";
import { FileTreeDownloadComponent } from "../file-tree-download";
import "./file-tree-view.scss";

export interface TreeRow {
    name: string;
    path: string;
    expanded: boolean;
    isDirectory: boolean;
    indent: number;
}

@Component({
    selector: "bl-file-tree-view",
    templateUrl: "file-tree-view.html",
})
export class FileTreeViewComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public fileNavigator: FileNavigator;
    @Input() public currentPath: string;
    @Input() public active: boolean = true;
    @Input() public name: string;
    @Input() public autoExpand = false;
    @Input() public canDropExternalFiles = false;
    @Input() public canDeleteFiles = false;
    @Output() public navigate = new EventEmitter<string>();
    @Output() public dropFiles = new EventEmitter<FileDropEvent>();
    @Output() public deleteFiles = new EventEmitter<FileDeleteEvent>();

    @HostBinding("class.expanded") public expanded = true;

    public expandedDirs: StringMap<boolean> = {};
    public treeRows: TreeRow[] = [];
    public refreshing: boolean;
    public isDraging = 0;
    public dropTargetPath: string = null;
    public containerId: string;

    private _tree: FileTreeStructure;
    private _navigatorSubs: Subscription[] = [];
    private _paramsSubscriber: Subscription;

    constructor(private activatedRoute: ActivatedRoute,
                private dialog: DialogService,
                private contextMenuService: ContextMenuService,
                private shell: ElectronShell,
                private notificationService: NotificationService) { }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.containerId = params["id"];
        });
    }

    public ngOnChanges(inputs) {
        if (inputs.fileNavigator) {
            this._clearNavigatorSubs();

            this._navigatorSubs.push(this.fileNavigator.tree.subscribe((tree) => {
                this._tree = tree;
                this._buildTreeRows(tree);
            }));
        }

        if (inputs.currentPath) {
            this.expandPath(this.currentPath);
        }
    }

    public ngOnDestroy() {
        this._clearNavigatorSubs();
        this._paramsSubscriber.unsubscribe();
    }

    public handleClick(treeRow: TreeRow) {
        if (treeRow.isDirectory && !treeRow.expanded) {
            this.toggleExpanded(treeRow);
        }

        this.navigate.emit(treeRow.path);
    }

    /**
     * Show context menu when right click on a folder or a file
     */
    public showContextMenu(treeRow: TreeRow) {
        const items = [];
        items.push(new ContextMenuItem("Download", () => this.download(treeRow)));

        if (treeRow.isDirectory) {
            items.push(new ContextMenuItem("Refresh", () => this.refresh(treeRow.path)));
        }

        if (this.canDeleteFiles) {
            items.push(new ContextMenuItem("Delete", () => this.deleteFiles.emit({
                path: treeRow.path,
                isDirectory: treeRow.isDirectory,
            })));
        }

        if (items.length > 0) {
            this.contextMenuService.openMenu(new ContextMenu(items));
        }
    }

    public handleCaretClick(treeRow: TreeRow, event: MouseEvent) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.fileNavigator.loadPath(treeRow.path);
        this.toggleExpanded(treeRow);
    }

    /**
     * @param treeRow Tree row that should toggle the expansion
     * @returns boolean if the row is now expanded or not
     */
    public toggleExpanded(treeRow: TreeRow): boolean {
        const isExpanded = this.expandedDirs[treeRow.path];
        if (isExpanded) {
            this.expandedDirs[treeRow.path] = false;
        } else {
            this.expandedDirs[treeRow.path] = true;
        }
        this._buildTreeRows(this._tree);

        return !isExpanded;
    }

    /**
     * Expand all folder down to the given path
     */
    public expandPath(path: string) {
        if (path === "") { return; }
        const segments = path.split("/");
        for (let i = 0; i < segments.length; i++) {

            const pathToExpand = segments.slice(0, segments.length - i).join("/");
            this.expandedDirs[pathToExpand] = true;
        }

        if (this._tree) {
            this._buildTreeRows(this._tree);
        }
    }

    public handleClickTreeViewHeader() {
        this.expanded = true;
        this.navigate.emit("");
    }

    /**
     * Toggle expanding the global tree view
     */
    public toggleExpandTreeView(): boolean {
        this.expanded = !this.expanded;
        return this.expanded;
    }

    public collapseAll() {
        for (let key of Object.keys(this.expandedDirs)) {
            this.expandedDirs[key] = false;
        }
        this._buildTreeRows(this._tree);
    }

    public treeRowTrackBy(treeRow: TreeRow) {
        return treeRow.path;
    }

    /**
     * Treeview context menu directory/files download actions
     * @param treeRow
     */
    public download(treeRow: TreeRow) {
        if (treeRow.isDirectory) {
            const ref = this.dialog.open(FileTreeDownloadComponent);
            ref.componentInstance.containerId = this.containerId;
            ref.componentInstance.subfolder = treeRow.name;
            ref.componentInstance.pathPrefix = treeRow.path;
        } else {
            const dialog = remote.dialog;
            const localPath = dialog.showSaveDialog({
                buttonLabel: "Download",
                defaultPath: treeRow.name,
            });
            if (localPath) {
                this._saveFile(treeRow.path, treeRow.name, localPath);
            }
        }
    }

    public refresh(path?: string) {
        this.refreshing = true;
        this.fileNavigator.refresh(path).subscribe({
            next: () => {
                this.refreshing = false;
            },
            error: () => {
                this.refreshing = false;
            },
        });
    }

    public dragEnterRow(event: DragEvent, treeRow?: TreeRow) {
        event.stopPropagation();
        if (!this.canDropExternalFiles) { return; }
        this.isDraging++;
        this.dropTargetPath = this._getDropTarget(treeRow);
    }

    public dragLeaveRow(event: DragEvent, treeRow?: TreeRow) {
        event.stopPropagation();
        if (!this.canDropExternalFiles) { return; }

        this.isDraging--;
        if (this._getDropTarget(treeRow) === this.dropTargetPath && this.isDraging <= 0) {
            this.dropTargetPath = null;
        }
    }

    public handleDropOnRow(event: DragEvent, treeRow?: TreeRow) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.canDropExternalFiles) { return; }

        const path = this._getDropTarget(treeRow);
        const files = [...event.dataTransfer.files as any];
        this.dropTargetPath = null;
        this.isDraging = 0;
        this.dropFiles.emit({ path, files });
    }

    public handleDragHover(event: DragEvent) {
        DragUtils.allowDrop(event, this.canDropExternalFiles);
    }

    private _buildTreeRows(tree) {
        const root = tree.root;
        this.treeRows = this._getTreeRowsForNode(root);
    }

    private _getTreeRowsForNode(node: FileTreeNode, indent = 0): TreeRow[] {
        let rows = [];
        for (let [_, child] of node.children) {
            if (this.autoExpand && !(child.path in this.expandedDirs)) {
                this.expandedDirs[child.path] = true;
            }
            const expanded = this.expandedDirs[child.path];
            rows.push({
                name: child.name,
                path: child.path,
                expanded,
                isDirectory: child.isDirectory,
                indent: indent,
            });
            if (expanded) {
                if (child.children.size > 0) {
                    for (let row of this._getTreeRowsForNode(child, indent + 1)) {
                        rows.push(row);
                    }
                }
            }
        }

        return rows;
    }

    /**
     * Returns the path of the folder where the drop is actually happening
     * @param treeRow Tree row being targeted
     */
    private _getDropTarget(treeRow: TreeRow): string {
        if (!treeRow) {
            return "";
        } else if (treeRow.isDirectory) {
            return treeRow.path;
        } else {
            return CloudPathUtils.dirname(treeRow.path);
        }
    }

    private _clearNavigatorSubs() {
        this._navigatorSubs.forEach(x => x.unsubscribe());
    }

    /**
     * Save treeview file to local disk
     * @param filePath
     * @param fileName
     * @param pathToFile
     */
    private _saveFile(filePath: string, fileName: string, pathToFile: string) {
        if (pathToFile === undefined) {
            return;
        }
        const obs = this.fileNavigator.getFile(filePath).download(pathToFile);
        obs.subscribe({
            next: () => {
                this.shell.showItemInFolder(pathToFile);
                this.notificationService.success("Download complete!", `File was saved locally at ${pathToFile}`);
            },
            error: (error: ServerError) => {
                this.notificationService.error(
                    "Download failed",
                    `${fileName} failed to download. ${error.message}`,
                );
            },
        });
        return obs;
    }
}
