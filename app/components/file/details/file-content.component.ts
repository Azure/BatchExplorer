import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import { SettingsService } from "app/services";
import { FileLoader } from "app/services/file";
import { log } from "app/utils";
import "./file-content.scss";

enum FileType {
    log = "log",
    image = "image",
    code = "code",
}

@Component({
    selector: "bl-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges {
    public FileType = FileType;

    @Input() public fileLoader: FileLoader;
    @Input() public tailable: boolean = false;

    public fileType: FileType;

    constructor(private settingsService: SettingsService) { }
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.fileLoader) {
            if (!this.fileLoader) {
                log.error("FileContentComponent fileLoader input is required but is", this.fileLoader);
            }
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
