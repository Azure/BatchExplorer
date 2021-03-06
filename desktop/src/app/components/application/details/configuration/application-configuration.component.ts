import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BatchApplication } from "app/models";

@Component({
    selector: "bl-application-configuration",
    templateUrl: "application-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationConfigurationComponent {
    @Input() public application: BatchApplication;

}
