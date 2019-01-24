import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener } from "@angular/core";
import { FileSystemService } from "@batch-flask/electron";
import { DialogService, NotificationService } from "@batch-flask/ui";
import { DragUtils } from "@batch-flask/utils";
import { SubmitLocalTemplateComponent } from "../../submit-local-template";
import "./local-template-drop-zone.scss";

@Component({
    selector: "bl-local-template-drop-zone",
    templateUrl: "local-template-drop-zone.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateDropZoneComponent {

    public isDraging = 0;
    public loading: boolean;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private dialogService: DialogService,
        private notificationService: NotificationService,
        private fs: FileSystemService) { }

    public async submitTemplate(file: string) {
        if (!file) { return; }
        this.loading = true;
        this.changeDetector.markForCheck();
        const content = await this.fs.readFile(file);
        const ref = this.dialogService.open(SubmitLocalTemplateComponent);
        ref.componentInstance.filename = file;
        ref.componentInstance.template = content;
        this.loading = false;
        this.changeDetector.markForCheck();
    }

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        const allowDrop = this._canDrop(event.dataTransfer);
        DragUtils.allowDrop(event, allowDrop);
    }

    @HostListener("dragenter", ["$event"])
    public dragEnter(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        event.stopPropagation();
        this.isDraging++;
    }

    @HostListener("dragleave", ["$event"])
    public dragLeave(event: DragEvent) {

        if (!this._canDrop(event.dataTransfer)) { return; }
        this.isDraging--;
    }

    @HostListener("drop", ["$event"])
    public handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this._resetDragDrop();

        const filesAndFolders = [...event.dataTransfer.files as any];
        if (filesAndFolders.length > 1) {
            this.notificationService.error("Please drop only one file at the time", "");
        } else if (filesAndFolders.length === 1) {
            this.submitTemplate(filesAndFolders[0].path);
        }

        this.isDraging = 0;
    }

    private _canDrop(dataTransfer: DataTransfer) {
        return dataTransfer.types.includes("Files");
    }

    private _resetDragDrop() {
        this.loading = false;
    }
}
