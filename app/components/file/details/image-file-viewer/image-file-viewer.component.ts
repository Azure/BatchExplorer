import { Component, Input } from "@angular/core";
import { remote } from "electron";
const { app } = remote;
import * as path from "path";

import { FileSystemService } from "app/services";
import "./image-file-viewer.scss";

@Component({
    selector: "bl-image-file-viewer",
    templateUrl: "image-file-viewer.html",
})
export class ImageFileViewerComponent implements OnInit, OnChanges {
    @Input()
    public fileLoader: FileLoader;

    public src: string;

    constructor(private fs: FileSystemService) {

    }
    public ngOnInit() {
        this._loadImage();
    }

    public ngOnChanges(changes) {
        this._loadImage();
    }

    private _loadImage() {
        const destination = path.join(this.fs.commonFolders.temp, "task-output", this.fileLoader.filename);
        console.log("Going to save to file", destination);
        this.fileLoader.download(destination).subscribe((result) => {
            console.log("Result", result);
            this.src = `file://${destination}`;
        });

    }
