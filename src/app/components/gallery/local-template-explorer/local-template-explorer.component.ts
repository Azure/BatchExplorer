import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { DialogService, FileExplorerConfig, FileExplorerWorkspace, FileNavigator } from "@batch-flask/ui";
import { NcjTemplateType } from "app/models";
import { LocalTemplateFolder, LocalTemplateService } from "app/services";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LocalTemplateSourceFormComponent } from "./local-template-source-form";

import "./local-template-explorer.scss";

@Component({
    selector: "bl-local-template-explorer",
    templateUrl: "local-template-explorer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateExplorerComponent implements OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "User template library" };
    }

    public NcjTemplateType = NcjTemplateType;
    public fileNavigator: FileNavigator;
    public workspace: FileExplorerWorkspace;
    public sources: LocalTemplateFolder[] = null;

    public fileExplorerConfig: FileExplorerConfig = {
        viewer: {
            fileAssociations: [
                { extension: ".json", type: "ncj-template" },
            ],
        },
    };

    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private localTemplateService: LocalTemplateService,
        private dialogService: DialogService) {

        localTemplateService.sources.pipe(takeUntil(this._destroy)).subscribe((sources) => {
            this.sources = sources;
            this._updateWorkspace();
            this.changeDetector.markForCheck();
        });

    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public manageSources() {
        this.dialogService.open(LocalTemplateSourceFormComponent);
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
