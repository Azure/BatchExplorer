import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { TreeComponentItem } from "app/models/tree-component-item";
import { TreeComponentUtils, prettyBytes } from "app/utils";

@Component({
    selector: "bl-file-list-display",
    templateUrl: "file-list-display.html",
})
export class FileListDisplayComponent implements OnChanges {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public files: List<File>;

    @Input()
    public status: LoadingStatus;

    @Input()
    public filter: any;

    @Input()
    public baseUrl: any[];

    /**
     * If true then create link to /blobs/filename rather than /files/filename
     */
    @Input()
    public isBlob: boolean = false;

    public treeNodes: TreeComponentItem[] = [];

    constructor(private router: Router) { }

    public ngOnChanges(changes: SimpleChanges): void {
        // fires data model decoration if files inputs changed
        if (changes["files"] && this.files.size > 0) {
            const fileList = this.files.filter(file => file.isDirectory === false).toArray();
            this.treeNodes = TreeComponentUtils.unflattenFileDirectory(fileList);
        }
    }

    public prettyFileSize(size: string) {
        // having falsy issues with contentLength = 0
        return prettyBytes(parseInt(size || "0", 10));
    }

    /**
     * Handle linking to files from blob storage as well as the task and node API
     * @param fileName - name if the file
     */
    public urlToFile(fileName: string) {
        const filePathPart = this.isBlob ? "blobs" : "files";
        return this.baseUrl.concat([filePathPart, fileName]);
    }

    public isErrorState(file: any) {
        return false;
    }

    public treeOnActivate($event) {
        if ($event.node && $event.node.isLeaf) {
            const routerLink = this.urlToFile($event.node.data.fileName);
            this.router.navigate(routerLink);
        }
    }
}
