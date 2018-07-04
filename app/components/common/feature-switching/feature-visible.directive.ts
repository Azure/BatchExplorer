import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subscription } from "rxjs";

import { WorkspaceService } from "app/services";

@Directive({
    selector: "[blFeatureOn]",
})
export class FeatureVisibleDirective implements OnInit, OnDestroy  {
    // tslint:disable-next-line:no-input-rename
    @Input("blFeatureOn")
    public feature: string;

    private _subscription: Subscription;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private workspaceService: WorkspaceService,
    ) {
    }

    public ngOnInit() {
        this._subscription = this.workspaceService.currentWorkspace.subscribe((workspace) => {
            this.viewContainer.clear();
            // always visible if there is no workspace selected
            const enabled = workspace.isFeatureEnabled(this.feature);
            console.log(`feature: ${this.feature} enabled: ${enabled}`);
            if (!workspace || enabled) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            }
        });
    }

    public ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}
