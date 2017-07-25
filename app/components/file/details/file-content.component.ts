import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import { FileLoader } from "app/services/file";
import "./file-content.scss";

enum FileType {
    log,
    image,
    code,
}

const fileTypes = {
    [FileType.log]: ["txt", "log"],
    [FileType.image]: ["png", "jpg", "gif"],
    [FileType.code]: ["json", "ts2", "js", "java", "cs", "cpp", "h", "hpp", "py", "xml", "sh", "cmd", "bat"],
};

@Component({
    selector: "bl-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges {
    public FileType = FileType;

    @Input() public fileLoader: FileLoader;

    public fileType: FileType;

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.fileLoader) {
            this._findFileType();
        }
    }

    public openAs(type: FileType) {
        this.fileType = type;
    }

    private _findFileType() {
        const filename = this.fileLoader.filename;
        if (!filename) {
            throw new Error(`Expect filename to be a valid string but was "${filename}"`);
        }

        const name = filename.toLowerCase();
        for (let type of Object.keys(fileTypes)) {
            const extensions = fileTypes[type];
            for (let ext of extensions) {
                if (name.endsWith(`.${ext}`)) {
                    this.fileType = type as any;
                    return;
                }
            }
        }

        this.fileType = null;
    }
}
