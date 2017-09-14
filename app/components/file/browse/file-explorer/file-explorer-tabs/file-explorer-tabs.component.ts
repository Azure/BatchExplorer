import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import * as path from "path";
import "./file-explorer-tabs.scss";

interface Tab {
    filename: string;
    displayName: string;
}

@Component({
    selector: "bl-file-explorer-tabs",
    templateUrl: "file-explorer-tabs.html",
})
export class FileExplorerTabsComponent implements OnChanges {
    @Input() public activeFile = null;
    @Output() public activeFileChange = new EventEmitter<string>();

    @Input() public openedFiles: string[] = [];

    public tabs: Tab[] = [];

    public ngOnChanges(changes) {
        if (changes.openedFiles) {
            this._updateTabs();
        }
    }

    public activateTab(tab: Tab) {
        const filename = tab && tab.filename;
        this.activeFile = filename;
        this.activeFileChange.emit(filename);
    }

    private _updateTabs() {
        this.tabs = this.openedFiles.map((filename) => {
            return {
                filename,
                displayName: path.basename(filename),
            };
        });
    }
}
