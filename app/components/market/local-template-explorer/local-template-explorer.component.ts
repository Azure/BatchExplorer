import { ChangeDetectionStrategy, Component, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { DialogService, FileExplorerWorkspace, FileNavigator } from "@batch-flask/ui";
import { NcjTemplateType } from "app/models";
import { LocalTemplateFolder, LocalTemplateService } from "app/services";
import { Subscription } from "rxjs";
import { LocalTemplateSourceFormComponent } from "./local-template-source-form";

import "./local-template-explorer.scss";

@Component({
    selector: "bl-local-template-explorer",
    templateUrl: "local-template-explorer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateExplorerComponent implements OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "User template library"};
    }

    public NcjTemplateType = NcjTemplateType;
    public fileNavigator: FileNavigator;
    public workspace: FileExplorerWorkspace;
    public sources: LocalTemplateFolder[] = null;

    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private localTemplateService: LocalTemplateService,
        private dialogService: DialogService) {

        localTemplateService.sources.subscribe((sources) => {
            this.sources = sources;
            this._updateWorkspace();
        });

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

    private _updateWorkspace() {
        if (this.workspace) {
            this.workspace.dispose();
            this.workspace = null;
        }
        if (this.sources.length === 0) {
            return;
        }
        this.workspace = new FileExplorerWorkspace(this.sources.map(x => {
            return {
                name: x.name,
                navigator: this.localTemplateService.navigate(x),
            };
        }));

        for (const source of this.workspace.sources) {
            source.navigator.init();
        }
        this.changeDetector.markForCheck();

    }
}
