import { Component, Input } from "@angular/core";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { File, NodeFileTypes } from "app/models";

@Component({
    selector: "bex-file-list-display",
    templateUrl: "./file-list-display.html",
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
    public fileType: NodeFileTypes;

    @Input()
    public status: LoadingStatus;

    public isErrorState(file: any) {
        // if (node.state === "startTaskFailed") {
        //     return true;
        // }
        return false;
    }
}
