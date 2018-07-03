import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { Workspace } from "app/models";

// tslint:disable:no-var-requires max-line-length
const adminWorkspace = JSON.parse(require("app/components/workspace/json-templates/admin-workspace.json"));
const endUserWorkspace = JSON.parse(require("app/components/workspace/json-templates/end-user-workspace.json"));
// tslint:enable:no-var-requires max-line-length

@Injectable()
export class WorkspaceService {
    private _workspaces: BehaviorSubject<List<Workspace>> = new BehaviorSubject(List([]));
    private _currentWorkspace: BehaviorSubject<Workspace> = new BehaviorSubject(null);
    private _haveWorkspacesLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor() {
        // nothing in here at the moment
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
        this._currentWorkspace.next(workspace);
    }

    public isFeatureEnabled(feature: string): boolean {
        const workspace = this._currentWorkspace.value;
        if (workspace) {
            return workspace.isFeatureEnabled(feature);
        }

        // TODO: default to true if there is no workspace selected?
        return true;
    }

    private loadWorkspaces() {
        const workspaces = [
            new Workspace({ ...adminWorkspace }),
            new Workspace({ ...endUserWorkspace }),
        ];

        console.log("loaded workspaces: ", workspaces);
        this._workspaces.next(List(workspaces));
        this._currentWorkspace.next(workspaces[1]);
        this._haveWorkspacesLoaded.next(true);
    }
}
