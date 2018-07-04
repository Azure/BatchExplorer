import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { Workspace } from "app/models";
import { WorkspaceService } from "app/services";
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
    public selectedWorkspaceName: string = "";
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
            this.selectedWorkspaceId = workspace.id;
            this.selectedWorkspaceName = workspace.name;
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
