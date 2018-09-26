import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";

import "./local-template-explorer.scss";

@Component({
    selector: "bl-local-template-explorer",
    templateUrl: "local-template-explorer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateExplorerComponent {
    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
