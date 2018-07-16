import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
} from "@angular/core";
import { MouseButton } from "@batch-flask/core";
import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { FileExplorerWorkspace, FileSource, OpenedFile } from "app/components/file/browse/file-explorer";
import { FileLoader } from "app/services/file";
import * as path from "path";
import { Subscription } from "rxjs/Rx";
import "./file-explorer-tabs.scss";

interface Tab {
    index: number;
    filename: string;
    displayName: string;
    fileLoader: FileLoader;
    source: FileSource;
}

@Component({
    selector: "bl-file-explorer-tabs",
    templateUrl: "file-explorer-tabs.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileExplorerTabsComponent implements OnChanges, OnDestroy {
    @Input() public workspace: FileExplorerWorkspace;

    public openedFiles: OpenedFile[] = [];
    public tabs: Tab[] = [];
    public activePath: string = null;

    private _workspaceSubs: Subscription[] = [];
    private _lastFolderExplored: any = null;

    constructor(private changeDetector: ChangeDetectorRef, private contextMenuService: ContextMenuService) { }

    public ngOnChanges(changes) {
        if (changes.workspace) {
            this._updateWorkspaceEvents();
        }
    }

    public ngOnDestroy() {
        this._clearFileNavigatorSub();
    }

    @HostListener("mousedown", ["$event"])
    public disableClickDefaultActions(event) {
        if (event.button === MouseButton.left) {
            event.preventDefault(); // Prevent focus on left click
        }
        if (event.button === MouseButton.middle) {
            event.preventDefault(); // Prevent scrolling on middle click
            event.stopPropagation();
            return;
        }

    }

    public handleMouseUp(event: MouseEvent, tab) {
        if (event.button === MouseButton.middle) { // Middle click
            this.closeTab(tab, event);
        } else if (event.button === MouseButton.right) {
            this.showContextMenu(tab);
        }
    }

    public closeTab(tab: Tab, event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        const newIndex = tab.index - 1;
        const newTab = newIndex === -1 ? null : this.tabs[newIndex];
        this.activateTab(newTab);
        this.workspace.closeFile(tab.filename, tab.source);
    }

    public closeOtherTabs(tab: Tab) {
        this.activateTab(tab);
        for (const openTab of this.tabs) {
            if (openTab.filename !== tab.filename) {
                this.workspace.closeFile(openTab.filename, tab.source);
            }
        }
    }

    public closeAllTabs() {
        this.activateTab(null);
        for (const openedTab of this.tabs) {
            this.workspace.closeFile(openedTab.filename, openedTab.source);
        }
    }

    public activateTab(tab: Tab) {
        if (tab) {
            this.workspace.navigateTo(tab.filename, tab.source);
        } else {
            // Todo change default
            this.workspace.navigateTo(this._lastFolderExplored.path, this._lastFolderExplored.source);
        }
    }

    public showContextMenu(tab: Tab) {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Close", () => this.closeTab(tab)),
            new ContextMenuItem("Close others", () => this.closeOtherTabs(tab)),
            new ContextMenuItem("Close All", () => this.closeAllTabs()),
        ]));
    }

    public trackByFn(index, tab: Tab) {
        return tab.filename;
    }

    private _updateWorkspaceEvents() {
        this._lastFolderExplored = "";
        this._workspaceSubs.push(this.workspace.openedFiles.subscribe((files) => {
            this.openedFiles = files;
            this._updateTabs();
        }));
        this._workspaceSubs.push(this.workspace.currentNode.subscribe((node) => {
            if (node.treeNode.isDirectory && !node.treeNode.isUnknown) {
                this.activePath = null;
                this._lastFolderExplored = node;
            } else {
                this.activePath = node.path;
            }
        }));
    }

    private _clearFileNavigatorSub() {
        this._workspaceSubs.forEach(x => x.unsubscribe());
    }

    private _updateTabs() {
        this.tabs = this.openedFiles.map((file, index) => {
            return {
                index,
                filename: file.path,
                displayName: path.basename(file.path),
                fileLoader: file.loader,
                source: file.source,
            };
        });
        this.changeDetector.markForCheck();
    }
}
