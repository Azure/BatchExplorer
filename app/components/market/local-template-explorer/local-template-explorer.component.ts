import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { LocalTemplate, LocalTemplateService } from "app/services";
import { Subscription } from "rxjs";

import { DialogService } from "@batch-flask/ui";
import "./local-template-explorer.scss";
import { LocalTemplateSourceFormComponent } from "./local-template-source-form";

@Component({
    selector: "bl-local-template-explorer",
    templateUrl: "local-template-explorer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateExplorerComponent implements OnDestroy {
    public templates: LocalTemplate[];

    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private localTemplateService: LocalTemplateService,
        private dialogService: DialogService) {

        this._subs.push(localTemplateService.templates.subscribe((templates) => {
            this.templates = templates;
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public manageSources() {
        this.dialogService.open(LocalTemplateSourceFormComponent);
    }
}
