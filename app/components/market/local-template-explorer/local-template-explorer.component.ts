import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { DialogService, FileExplorerWorkspace, FileNavigator } from "@batch-flask/ui";
import { NcjTemplateType } from "app/models";
import { LocalTemplate, LocalTemplateFolder, LocalTemplateService } from "app/services";
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
    public fileNavigator: FileNavigator;
    public workspace: FileExplorerWorkspace;

    private _subs: Subscription[] = [];
    private _sources: LocalTemplateFolder[];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private localTemplateService: LocalTemplateService,
        private dialogService: DialogService) {

        this._subs.push(localTemplateService.templates.subscribe((templates) => {
            this.templates = templates;
            this.changeDetector.markForCheck();
        }));
        localTemplateService.sources.subscribe((sources) => {
            this._sources = sources;
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
        if (this._sources.length === 0) {
            return;
        }
        this.workspace = new FileExplorerWorkspace(this._sources.map(x => {
            return {
                name: x.name,
                navigator: this.localTemplateService.navigate(x),
            };
        }));

        for (const source of this.workspace.sources) {
            source.navigator.init();
        }

    }
}
