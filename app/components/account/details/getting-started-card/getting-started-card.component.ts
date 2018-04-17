import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ElectronShell } from "@batch-flask/ui";

import "./getting-started-card.scss";

@Component({
    selector: "bl-getting-started-card",
    templateUrl: "getting-started-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GettingStartedCardComponent {
    constructor(private shell: ElectronShell) {

    }

    public gotoAztkDoc() {
        this.shell.openExternal("https://github.com/Azure/aztk")
    }

    public gotoDoAzureParallelDoc() {
        this.shell.openExternal("https://github.com/Azure/doAzureParallel")
    }
}
