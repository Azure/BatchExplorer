import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ElectronRemote, FileSystemService } from "@batch-flask/electron";
import { DialogService } from "@batch-flask/ui";
import { SubmitLocalTemplateComponent } from "../../submit-local-template";

@Component({
    selector: "bl-local-template-pick-button",
    templateUrl: "local-template-pick-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplatePickButtonComponent {

    public isDraging = 0;
    public loading: boolean;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private dialogService: DialogService,
        private notificationService: ElectronRemote,
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

    public pickALocalTemplate() {
        const files = this.notificationService.dialog.showOpenDialogSync({
            filters: [
                { extensions: ["json"], name: "Json (*.json)" },
                { extensions: ["*"], name: "All files (*.*)" },
            ],
            properties: ["openFile"],
        });

        if (files && files.length > 0) {
            this.submitTemplate(files[0]);
        }
    }
}
