import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { ElectronRemote, ElectronShell } from "@batch-flask/electron";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { NotificationService } from "@batch-flask/ui/notifications";

import "./file-too-large.scss";

@Component({
    selector: "bl-file-too-large",
    templateUrl: "file-too-large.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTooLargeComponent {
    @Input() public file: File;

    @Input() public fileLoader: FileLoader;

    public downloading = false;

    constructor(
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
    ) { }

    public async download() {
        this.downloading = true;
        this.changeDetector.markForCheck();
        const dialog = this.remote.dialog;
        const saveDialog = await dialog.showSaveDialog({
            buttonLabel: "Download",
            // Set default filename of file to download
            defaultPath: this.file.name,
        });

        if (!saveDialog || !saveDialog.filePath) {
            return;
        }
        this.fileLoader.download(saveDialog.filePath).subscribe(() => {
            this.downloading = false;
            this.changeDetector.markForCheck();

            this.shell.showItemInFolder(saveDialog.filePath);
            this.notificationService.success("Download complete!", `File was saved locally at ${saveDialog.filePath}`);
        });
    }

    public open() {
        this.downloading = true;
        this.changeDetector.markForCheck();

        this.fileLoader.getLocalVersionPath().subscribe((pathToFile) => {
            this.downloading = false;
            this.changeDetector.markForCheck();

            this.shell.openItem(pathToFile);
        });
    }
}
