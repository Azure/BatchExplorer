import { Injectable, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { Workspace } from "app/models";
import { Constants } from "common";

// tslint:disable:no-var-requires max-line-length
// TODO-TIM move that out of here
const adminWorkspace = JSON.parse(require("app/components/workspace/json-templates/admin-workspace.json"));
const endUserWorkspace = JSON.parse(require("app/components/workspace/json-templates/end-user-workspace.json"));
// tslint:enable:no-var-requires max-line-length

@Injectable()
export class WorkspaceService implements OnDestroy {
    private _workspaces: BehaviorSubject<List<Workspace>> = new BehaviorSubject(List([]));
    private _currentWorkspace: BehaviorSubject<Workspace> = new BehaviorSubject(null);
    private _currentWorkspaceId: BehaviorSubject<string> = new BehaviorSubject(null);
    private _haveWorkspacesLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _sub: Subscription;

    constructor() {
        this._sub = this._currentWorkspace.subscribe((ws: Workspace) => {
            if (ws) {
                // save the current selection to local storage
                localStorage.setItem(Constants.localStorageKey.selectedWorkspaceId, ws.id);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public get workspaces(): Observable<List<Workspace>> {
        return this._workspaces.asObservable();
    }

    public get currentWorkspace(): Observable<Workspace> {
        return this._currentWorkspace.asObservable();
    }

    public get haveWorkspacesLoaded(): Observable<boolean> {
        return this._haveWorkspacesLoaded.asObservable();
    }

    public init() {
        this.loadWorkspaces();
    }

    public selectWorkspace(workspaceId: string) {
        const workspace = this._workspaces.value.find((ws: Workspace) => ws.id === workspaceId);
        this._currentWorkspaceId.next(workspaceId);
        this._currentWorkspace.next(workspace);
    }

    public isFeatureEnabled(feature: string): boolean {
        return this._currentWorkspace.value.isFeatureEnabled(feature);
    }

    public isFeatureDisabled(feature: string): boolean {
        return !this._currentWorkspace.value.isFeatureEnabled(feature);
    }

    private loadWorkspaces() {
        // TODO: eventually load any user workspaces as well
        const workspaces = [
            new Workspace({ ...adminWorkspace }),
            new Workspace({ ...endUserWorkspace }),
        ];

        this._workspaces.next(List(workspaces));
        const selectedWorkspaceId = localStorage.getItem(Constants.localStorageKey.selectedWorkspaceId);
        if (selectedWorkspaceId) {
            this.selectWorkspace(selectedWorkspaceId);
        } else {
            this._currentWorkspace.next(workspaces.first());
            this._currentWorkspaceId.next(this._currentWorkspace.value.id);
        }

        this._haveWorkspacesLoaded.next(true);
    }
}
