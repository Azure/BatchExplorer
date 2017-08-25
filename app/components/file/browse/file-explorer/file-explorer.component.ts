import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { FileLoader, FileNavigator, FileTreeNode } from "app/services/file";
import "./file-explorer.scss";

/**
 * File explorer is a combination of the tree view and the file preview.
 */
@Component({
    selector: "bl-file-explorer",
    templateUrl: "file-explorer.html",
})
export class FileExplorerComponent implements OnChanges, OnDestroy {
    @Input() public fileNavigator: FileNavigator;
    @Input() public fileLoader: FileLoader;

    public LoadingStatus = LoadingStatus;
    public currentNode: FileTreeNode;

    private _currentNodeSub: Subscription;

    public ngOnChanges(inputs) {
        if (inputs.fileNavigator) {
            this._clearCurrentNodeSub();
            this._currentNodeSub = this.fileNavigator.currentNode.subscribe((node) => {
                this.currentNode = node;
            });
        }
    }

    public ngOnDestroy() {
        this._clearCurrentNodeSub();
    }

    public navigateTo(path: string) {
        this.fileNavigator.navigateTo(path);
    }

    private _clearCurrentNodeSub() {
        if (this._currentNodeSub) {
            this._currentNodeSub.unsubscribe();
        }
    }
}
