import { Component, Input } from "@angular/core";

import { FileLoader } from "app/services/file";
import "./file-explorer.scss";

/**
 * File explorer is a combination of the tree view and the file preview.
 */
@Component({
    selector: "bl-file-explorer",
    templateUrl: "file-explorer.html",
})
export class FileExplorerComponent {
    @Input() public fileLoader: FileLoader;
}
