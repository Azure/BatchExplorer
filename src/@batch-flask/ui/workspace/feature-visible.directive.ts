import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subscription } from "rxjs";
import { WorkspaceService } from "./workspace.service";

@Directive({
    selector: "[blFeatureOn]",
})
export class FeatureVisibleDirective implements OnInit, OnDestroy  {
    // tslint:disable-next-line:no-input-rename
    @Input("blFeatureOn") public feature: string;

    private _subscription: Subscription;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private workspaceService: WorkspaceService,
    ) {
    }

    public ngOnInit() {
        this._subscription = this.workspaceService.currentWorkspace.subscribe((workspace) => {
            if (this.feature && workspace) {
                this.viewContainer.clear();
                // always visible if there is no workspace selected
                const enabled = workspace.isFeatureEnabled(this.feature);
                if (!workspace || enabled) {
                    this.viewContainer.createEmbeddedView(this.templateRef);
                }
            }
        });
    }

    public ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
}
