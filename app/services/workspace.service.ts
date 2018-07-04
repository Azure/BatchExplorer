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
    private _currentWorkspaceId: BehaviorSubject<string> = new BehaviorSubject(null);
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

    public get currentWorkspaceId(): Observable<string> {
        return this._currentWorkspaceId.asObservable();
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

    private loadWorkspaces() {
        const workspaces = [
            new Workspace({ ...adminWorkspace }),
            new Workspace({ ...endUserWorkspace }),
        ];

        this._workspaces.next(List(workspaces));
        this._currentWorkspace.next(workspaces[1]);
        this._currentWorkspaceId.next(this._currentWorkspace.value.id);
        this._haveWorkspacesLoaded.next(true);
    }
}
