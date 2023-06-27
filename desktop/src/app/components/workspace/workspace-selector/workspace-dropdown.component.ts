import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { Workspace, WorkspaceService } from "@batch-flask/ui";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import "./workspace-dropdown.scss";

@Component({
    selector: "bl-workspace-dropdown",
    templateUrl: "workspace-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDropDownComponent implements OnDestroy {
    public workspaces: Observable<List<Workspace>>;
    public selectedWorkspaceId: string = "";
    public selectButtonText: string = "";
    public loaded = false;

    private _subscriptions: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private workspaceService: WorkspaceService) {

        this.workspaces = this.workspaceService.workspaces;
        this._subscriptions.push(this.workspaces.subscribe((workspaces) => {
            this.loaded = true;
            this.changeDetector.markForCheck();
        }));

        this._subscriptions.push(this.workspaceService.currentWorkspace.subscribe((workspace) => {
            // for when the initial workspace is set or the user selects another one
            if (workspace) {
                this.selectedWorkspaceId = workspace.id;
                this.selectButtonText = workspace.name;
            } else {
                this.selectButtonText = "No workspace selected";
            }

            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
     }

    public setWorkspace(workspace: Workspace) {
        if (workspace) {
            this.workspaceService.selectWorkspace(workspace.id);
        } else {
            this.workspaceService.selectWorkspace(null);
        }
    }

    public trackByFn(index, workspace: Workspace) {
        return workspace.id;
    }
}
