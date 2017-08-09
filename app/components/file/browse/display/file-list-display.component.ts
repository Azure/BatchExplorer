import { Component, EventEmitter, Input, Output } from "@angular/core";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { DateUtils, prettyBytes } from "app/utils";

@Component({
    selector: "bl-file-list-display",
    templateUrl: "file-list-display.html",
})
export class FileListDisplayComponent {
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

    @Input() public disableRouting = false;

    @Input() public activeItem: string;

    @Output() public activeItemChange = new EventEmitter();

    public prettyFileSize(size: string) {
        // having falsy issues with contentLength = 0
        return prettyBytes(parseInt(size || "0", 10));
    }

    public prettyDate(date: Date) {
        return DateUtils.customFormat(date, "MMM Do, YYYY, HH:mm:ss");
    }

    /**
     * Handle linking to files from blob storage as well as the task and node API
     * @param fileName - name if the file
     */
    public urlToFile(fileName: string) {
        if (this.disableRouting) {
            return null;
        }
        const filePathPart = this.isBlob ? "blobs" : "files";
        return this.baseUrl.concat([filePathPart, fileName]);
    }

    public isErrorState(file: any) {
        return false;
    }

    public updateActiveItem(item: string) {
        this.activeItem = item;
        this.activeItemChange.emit(item);
    }
}
