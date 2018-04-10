import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    HostBinding, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { FileNavigator, FileTreeNode, FileTreeStructure } from "app/services/file";
import { CloudPathUtils, DragUtils } from "app/utils";
import { FileDeleteEvent, FileDropEvent } from "../file-explorer.component";

import { ServerError } from "@batch-flask/core";
import { ElectronRemote, ElectronShell } from "@batch-flask/ui";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { DownloadFolderComponent } from "app/components/common/download-folder-dialog";
import "./file-tree-view.scss";

export interface TreeRow {
    name: string;
    path: string;
    expanded: boolean;
    isDirectory: boolean;
    indent: number;
    index: number;
}

@Component({
    selector: "bl-file-tree-view",
    templateUrl: "file-tree-view.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTreeViewComponent implements OnChanges, OnDestroy {
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

    public expandedDirs = new Set<string>();
    public treeRows: TreeRow[] = [];
    public refreshing: boolean;
    public isDraging = 0;
    public dropTargetPath: string = null;
    public isFocused = false;
    public focusedIndex: number = 0;

    private _tree: FileTreeStructure;
    private _navigatorSubs: Subscription[] = [];

    constructor(
        private dialog: DialogService,
        private contextMenuService: ContextMenuService,
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService) { }

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
    }

    public activateRow(treeRow: TreeRow) {
        if (treeRow.isDirectory && !treeRow.expanded) {
            this.toggleExpanded(treeRow);
        }
        this.focusedIndex = treeRow.index;
        this.changeDetector.markForCheck();

        this.navigate.emit(treeRow.path);
    }

    public handleKeyboardNavigation(event) {
        const curTreeRow = this.treeRows[this.focusedIndex];
        switch (event.code) {
            case "ArrowDown": // Move focus down
                this.focusedIndex++;
                event.preventDefault();
                break;
            case "ArrowUp":   // Move focus up
                this.focusedIndex--;
                event.preventDefault();
                break;
            case "ArrowRight": // Expand current row if applicable
                this.expand(curTreeRow);
                event.preventDefault();
                break;
            case "ArrowLeft": // Expand current row if applicable
                this.collapse(curTreeRow);
                event.preventDefault();
                break;
            case "Space":
            case "Enter":
                this.activateRow(curTreeRow);
                event.preventDefault();
                return;
            default:
        }
        this.focusedIndex = (this.focusedIndex + this.treeRows.length) % this.treeRows.length;
        this.changeDetector.markForCheck();
    }

    public setFocus(focus: boolean) {
        this.isFocused = focus;
        this.changeDetector.markForCheck();
    }

    /**
     * Show context menu when right click on a folder or a file
     */
    public showContextMenu(treeRow: TreeRow) {
        const items = [];
        items.push(new ContextMenuItem("Download", () => this.download(treeRow)));

        if (treeRow.isDirectory) {
            items.push(new ContextMenuItem("Refresh", () => this.refresh(treeRow.path)));
            items.push(new ContextMenuItem("New folder", () => this.newVirtualFolder(treeRow.path)));
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

    public expand(treeRow: TreeRow) {
        if (this.expandedDirs.has(treeRow.path) || !treeRow.isDirectory) { return; }
        this.expandedDirs.add(treeRow.path);
        this.fileNavigator.loadPath(treeRow.path);
        this._buildTreeRows(this._tree);
    }

    public collapse(treeRow: TreeRow) {
        if (!this.expandedDirs.has(treeRow.path) || !treeRow.isDirectory) { return; }
        this.expandedDirs.delete(treeRow.path);
        this._buildTreeRows(this._tree);
    }

    /**
     * @param treeRow Tree row that should toggle the expansion
     * @returns boolean if the row is now expanded or not
     */
    public toggleExpanded(treeRow: TreeRow): boolean {
        const isExpanded = this.expandedDirs.has(treeRow.path);
        if (isExpanded) {
            this.expandedDirs.delete(treeRow.path);
        } else {
            this.expandedDirs.add(treeRow.path);
            this.fileNavigator.loadPath(treeRow.path);
        }
        this._buildTreeRows(this._tree);
        this.changeDetector.markForCheck();
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
            this.expandedDirs.add(pathToExpand);
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
        this.expandedDirs.clear();
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
            const ref = this.dialog.open(DownloadFolderComponent);
            ref.componentInstance.navigator = this.fileNavigator;
            ref.componentInstance.subfolder = treeRow.name;
            ref.componentInstance.folder = treeRow.path;
        } else {
            const dialog = this.remote.dialog;
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
        this.changeDetector.markForCheck();
        this.fileNavigator.refresh(path).subscribe({
            next: () => {
                this.refreshing = false;
                this.changeDetector.markForCheck();
            },
            error: () => {
                this.refreshing = false;
                this.changeDetector.markForCheck();
            },
        });
    }

    public dragEnterRow(event: DragEvent, treeRow?: TreeRow) {
        event.stopPropagation();
        if (!this.canDropExternalFiles) { return; }
        this.isDraging++;
        this.dropTargetPath = this._getDropTarget(treeRow);
        this.changeDetector.markForCheck();
    }

    public dragLeaveRow(event: DragEvent, treeRow?: TreeRow) {
        event.stopPropagation();
        if (!this.canDropExternalFiles) { return; }

        this.isDraging--;
        if (this._getDropTarget(treeRow) === this.dropTargetPath && this.isDraging <= 0) {
            this.dropTargetPath = null;
        }
        this.changeDetector.markForCheck();
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
        this.changeDetector.markForCheck();
    }

    public handleDragHover(event: DragEvent) {
        DragUtils.allowDrop(event, this.canDropExternalFiles);
    }

    public newVirtualFolder(path: string) {
        this.fileNavigator.addVirtualFolder(`${path}/foo`);
    }

    private _buildTreeRows(tree) {
        const root = tree.root;
        this.treeRows = this._getTreeRowsForNode(root);
        this.changeDetector.markForCheck();
    }

    private _getTreeRowsForNode(node: FileTreeNode, indent = 0): TreeRow[] {
        const rows = [];
        for (const [_, child] of node.children) {
            if (this.autoExpand && !(child.path in this.expandedDirs)) {
                this.expandedDirs.add(child.path);
            }
            const expanded = this.expandedDirs.has(child.path);
            rows.push({
                name: child.name,
                path: child.path,
                expanded,
                isDirectory: child.isDirectory,
                indent: indent,
            });
            if (expanded) {
                if (child.children.size > 0) {
                    for (const row of this._getTreeRowsForNode(child, indent + 1)) {
                        rows.push(row);
                    }
                }
            }
        }
        for (const [index, row] of rows.entries()) {
            row.index = index;
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
