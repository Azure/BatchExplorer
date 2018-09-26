import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { LocalTemplate, LocalTemplateService } from "app/services";
import { Subscription } from "rxjs";

import "./local-template-explorer.scss";

@Component({
    selector: "bl-local-template-explorer",
    templateUrl: "local-template-explorer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateExplorerComponent implements OnDestroy {
    public templates: LocalTemplate[];

    private _subs: Subscription[] = [];

    constructor(private changeDetector: ChangeDetectorRef, private localTemplateService: LocalTemplateService) {
        this._subs.push(localTemplateService.templates.subscribe((templates) => {
            this.templates = templates;
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }
}
