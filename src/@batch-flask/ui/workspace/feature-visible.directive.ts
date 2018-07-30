import {
    ChangeDetectorRef,
    Directive,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { Workspace } from "./workspace.model";
import { WorkspaceService } from "./workspace.service";

@Directive({
    selector: "[blFeatureOn]",
})
export class FeatureVisibleDirective implements OnInit, OnDestroy, OnChanges  {
    // tslint:disable-next-line:no-input-rename
    @Input("blFeatureOn") public feature: string;

    private _subscription: Subscription;
    private _workspace: Workspace;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private workspaceService: WorkspaceService,
    ) {
    }

    public ngOnInit() {
        this._subscription = this.workspaceService.currentWorkspace.subscribe((workspace)  => {
            this._workspace = workspace;
            this._updateVisibility();
        });
    }

    public ngOnChanges(changes) {
        if (changes.feature) {
            this._updateVisibility();
        }
    }

    public ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

    private _updateVisibility() {
        if (this.feature && this._workspace) {
            this.viewContainer.clear();
            // always visible if there is no workspace selected
            const enabled = this._workspace.isFeatureEnabled(this.feature);
            if (!this._workspace || enabled) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.changeDetector.detectChanges();
            }
        }
    }
}
