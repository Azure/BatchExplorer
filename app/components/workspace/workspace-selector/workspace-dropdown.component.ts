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
    public loaded = false;

    private _subscriptions: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private workspaceService: WorkspaceService) {

        this.workspaces = this.workspaceService.workspaces;
        this._subscriptions.push(this.workspaces.subscribe((workspaces) => {
            console.log("workspaces.subscribe: ", workspaces);
            this.loaded = true;
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
     }

    public setWorkspace(workspace: Workspace) {
        if (workspace) {
            this.selectedWorkspaceId = workspace.id;
            this.workspaceService.selectWorkspace(workspace.id);
        } else {
            this.selectedWorkspaceId = null;
        }

        this.changeDetector.markForCheck();
    }

    public trackByFn(index, workspace: Workspace) {
        return workspace.id;
    }
}
