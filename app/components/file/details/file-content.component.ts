import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import { SettingsService } from "app/services";
import { FileLoader } from "app/services/file";
import "./file-content.scss";

enum FileType {
    log = "log",
    image = "image",
    code = "code",
}

// const fileTypes = {
//     [FileType.log]: ["txt", "log"],
//     [FileType.image]: ["png", "jpg", "gif"],
//     [FileType.code]: ["json", "ts2", "js", "java", "cs", "cpp", "h", "hpp", "py", "xml", "sh", "cmd", "bat"],
// };

@Component({
    selector: "bl-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges {
    public FileType = FileType;

    @Input() public fileLoader: FileLoader;

    public fileType: FileType;

    constructor(private settingsService: SettingsService) { }
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

        console.log("Fil tyes", this.settingsService.settings);
        const name = filename.toLowerCase();
        for (let type of Object.keys(this.fileTypes)) {
            const extensions = this.fileTypes[type];
            for (let ext of extensions) {
                if (name.endsWith(`.${ext}`)) {
                    this.fileType = type as any;
                    return;
                }
            }
        }

        this.fileType = null;
    }

    public get fileTypes() {
        return this.settingsService.settings.fileTypes || {};
    }
}
