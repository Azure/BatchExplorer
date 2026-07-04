import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BatchApplication } from "app/models";

@Component({
    standalone: false,
    selector: "bl-application-configuration",
    templateUrl: "application-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationConfigurationComponent {
    @Input() public application: BatchApplication;

}
