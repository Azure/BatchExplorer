import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { FileNavigator, OpenedFile } from "app/services/file";
import * as path from "path";
import { Subscription } from "rxjs/Rx";
import "./file-explorer-tabs.scss";

interface Tab {
    filename: string;
    displayName: string;
}

@Component({
    selector: "bl-file-explorer-tabs",
    templateUrl: "file-explorer-tabs.html",
})
export class FileExplorerTabsComponent implements OnChanges, OnDestroy {
    @Input() public fileNavigator: FileNavigator;
    public openedFiles: OpenedFile[] = [];
    public tabs: Tab[] = [];
    public activePath: string = null;

    private _fileNavigatorSubs: Subscription[] = [];
    private _lastFolderExplored: string = "";

    public ngOnChanges(changes) {
        if (changes.fileNavigator) {
            this._updateFileNavigatorEvents();
        }
    }

    public ngOnDestroy() {
        this._clearFileNavigatorSub();
    }

    public activateTab(tab: Tab) {
        if (tab) {
            this.fileNavigator.navigateTo(tab.filename);
        } else {
            this.fileNavigator.navigateTo(this._lastFolderExplored);
        }
    }

    private _updateFileNavigatorEvents() {
        this._lastFolderExplored = "";
        this._fileNavigatorSubs.push(this.fileNavigator._openedFiles.subscribe((files) => {
            this.openedFiles = files;
            this._updateTabs();
        }));
        this._fileNavigatorSubs.push(this.fileNavigator.currentNode.subscribe((node) => {
            if (node.isDirectory) {
                this.activePath = null;
                this._lastFolderExplored = node.path;
            } else {
                this.activePath = node.path;
            }
        }));
    }

    private _clearFileNavigatorSub() {
        this._fileNavigatorSubs.forEach(x => x.unsubscribe());
    }

    private _updateTabs() {
        this.tabs = this.openedFiles.map((file) => {
            return {
                filename: file.path,
                displayName: path.basename(file.path),
            };
        });
    }
}
