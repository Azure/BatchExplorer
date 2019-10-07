import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from "@angular/core";

import "./callout.scss";

@Component({
    selector: "bl-callout",
    templateUrl: "callout.html",
    exportAs: "blCallout",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalloutComponent {
    @ViewChild(TemplateRef, { static: false }) public template: TemplateRef<any>;
}
