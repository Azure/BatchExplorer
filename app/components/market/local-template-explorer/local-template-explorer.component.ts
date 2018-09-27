import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { DialogService } from "@batch-flask/ui";
import { NcjTemplateType } from "app/models";
import { LocalTemplate, LocalTemplateService } from "app/services";
import { Subscription } from "rxjs";
import { LocalTemplateSourceFormComponent } from "./local-template-source-form";

import "./local-template-explorer.scss";

@Component({
    selector: "bl-local-template-explorer",
    templateUrl: "local-template-explorer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateExplorerComponent implements OnDestroy {
    public NcjTemplateType = NcjTemplateType;
    public templates: LocalTemplate[];

    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        localTemplateService: LocalTemplateService,
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

    public trackTemplate(index) {
        return index;
    }
}
