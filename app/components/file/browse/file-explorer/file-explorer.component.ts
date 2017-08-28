import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { FileNavigator, FileTreeNode } from "app/services/file";
import "./file-explorer.scss";

export interface FileNavigatorEntry {
    name: string;
    navigator: FileNavigator;
}

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

    public LoadingStatus = LoadingStatus;
    public currentNode: FileTreeNode;
    public currentFileNavigator: FileNavigator;

    private _currentNodeSub: Subscription;

    public ngOnChanges(inputs) {
        if (inputs.fileNavigator) {
            this.fileNavigators = [{ name: "Files", navigator: this.fileNavigator }];
        }
        if (inputs.fileNavigator || inputs.fileNavigators) {
            this.currentFileNavigator = this.fileNavigators.first().navigator;
            this._updateNavigatorEvents();
        }
    }

    public ngOnDestroy() {
        this._clearCurrentNodeSub();
    }

    public navigateTo(path: string) {
        this.currentFileNavigator.navigateTo(path);
    }

    public updateCurrentNavigator(navigator: FileNavigator) {
        this.currentFileNavigator = navigator;
        this._updateNavigatorEvents();
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
