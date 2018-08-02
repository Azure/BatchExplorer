import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { ElectronRemote, ElectronShell, File, FileLoader } from "@batch-flask/ui";
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

    public download() {
        this.downloading = true;
        this.changeDetector.markForCheck();
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
            this.changeDetector.markForCheck();

            this.shell.showItemInFolder(pathToFile);
            this.notificationService.success("Download complete!", `File was saved locally at ${pathToFile}`);
        });
    }

    public open() {
        this.downloading = true;
        this.changeDetector.markForCheck();

        this.fileLoader.cache().subscribe((pathToFile) => {
            this.downloading = false;
            this.changeDetector.markForCheck();

            this.shell.openItem(pathToFile);
        });
    }
}
