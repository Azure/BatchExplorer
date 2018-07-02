import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { Workspace } from "app/models";
import { WorkspaceService } from "app/services";
import { Subscription } from "rxjs";

import "./workspace-dropdown.scss";

@Component({
    selector: "bl-workspace-dropdown",
    templateUrl: "workspace-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDropDownComponent implements OnDestroy {
    public workspaces: Observable<List<Workspace>>;
    public selectedWorkspaceId: string = "";
    public showDropdown = false;
    
    private _subs: Subscription[] = [];

    constructor(
        public workspaceService: WorkspaceService,
        private changeDetector: ChangeDetectorRef) {

            this.workspaces = this.workspaceService.workspaces;
            this.workspaces.subscribe((items) => {
                console.log("loaded: ", items);
            });
            // this._subs.push(workspaceService.currentWorkspaceId.subscribe((workspaceId) => {
            //     if (workspaceId) {
            //         this.selectedId = workspaceId;
            //     } else {
            //         this.selectedId = null;
            //     }
            //     this.changeDetector.markForCheck();
            // }));

            // this.favorites = this.workspaceService.workspace;
            // this._subscriptions.push(this.favorites.subscribe((items) => {
            //     this.title = items.size > 0 ? `${items.size} favorite items pinned` : "No favorite items pinned";
            //     this.changeDetector.markForCheck();
            // }));

            // this._subscriptions.push(this.accountService.currentAccount.subscribe((account) => {
            //     this._accountEndpoint = account.properties.accountEndpoint;
            // }));
        }
        // private changeDetector: ChangeDetectorRef) {

        // this._subs.push(accountService.currentAccountId.subscribe((accountId) => {
        //     if (accountId) {
        //         this.selectedId = accountId;
        //         this.selectedAccountAlias = ArmResourceUtils.getAccountNameFromResourceId(accountId);
        //     } else {
        //         this.selectedId = null;
        //         this.selectedAccountAlias = "No account selected!";
        //     }
        //     this.changeDetector.markForCheck();
        // }));

        // this._subs.push(this.accountService.currentAccountValid.subscribe((status) => {
        //     this.currentAccountValid = status;
        //     this.changeDetector.markForCheck();
        // }));

        // this._subs.push(this.accountService.currentAccountInvalidError.subscribe((error) => {
        //     this.currentAccountInvalidError = error;
        //     this.changeDetector.markForCheck();
        // }));
    // }

    public trackByFn(index, workspace: Workspace) {
        return workspace.id;
    }

    public ngOnDestroy() {
       //  this._subs.forEach(x => x.unsubscribe());
    }
}
