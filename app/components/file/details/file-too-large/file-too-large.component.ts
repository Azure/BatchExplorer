import { Component, Input } from "@angular/core";
import { ElectronRemote, ElectronShell } from "app/services";

import { NotificationService } from "app/components/base/notifications";
import { File } from "app/models";
import { FileLoader } from "app/services/file";
import "./file-too-large.scss";

@Component({
    selector: "bl-file-too-large",
    templateUrl: "file-too-large.html",
})
export class FileTooLargeComponent {
    @Input()
    public file: File;

    @Input()
    public fileLoader: FileLoader;

    public downloading = false;

    constructor(
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private notificationService: NotificationService,
    ) { }

    public download() {
        this.downloading = true;
        const dialog = this.remote.dialog;
        const pathToFile = dialog.showSaveDialog({
            buttonLabel: "Download",
            // Set default filename of file to download
            defaultPath: this.file.name,
        });

        if (!pathToFile) {
            return;
        }
        this.fileLoader.download(pathToFile).subscribe(() => {
            this.downloading = false;

            this.shell.showItemInFolder(pathToFile);
            this.notificationService.success("Download complete!", `File was saved locally at ${pathToFile}`);
        });
    }

    public open() {
        this.downloading = true;

        this.fileLoader.cache().subscribe((pathToFile) => {
            this.downloading = false;
            this.shell.openExternal(pathToFile);
        });
    }
}
