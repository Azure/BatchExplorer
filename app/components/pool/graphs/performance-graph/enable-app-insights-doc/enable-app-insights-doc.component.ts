import { Component } from "@angular/core";
import { ElectronShell } from "@batch-flask/ui";

import "./enable-app-insights-doc.scss";

@Component({
    selector: "bl-enable-app-insights-doc",
    templateUrl: "enable-app-insights-doc.html",
})
export class EnableAppInsightsDocComponent {

    constructor(private shell: ElectronShell) { }

    public openDoc(suffix = "") {
        this.shell.openExternal(`https://github.com/Azure/batch-insights${suffix}`);
    }
}
