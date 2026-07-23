import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BatchApplication } from "app/models";

@Component({
    standalone: false,
    selector: "bl-application-preview",
    templateUrl: "application-preview.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationPreviewComponent {
    @Input() public application: BatchApplication;
}
