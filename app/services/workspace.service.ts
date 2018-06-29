import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { Workspace } from "app/models";

@Injectable()
export class WorkspaceService {
    private _workspaces: BehaviorSubject<List<Workspace>>;
    private _currentWorkspace: BehaviorSubject<Workspace>;
    private _haveWorkspacesLoaded: BehaviorSubject<boolean>;

    constructor() {
        // todo: move these in-line when i have something interesting to put into the constructor
        this._workspaces = new BehaviorSubject<List<Workspace>>(List([]));
        this._currentWorkspace = new BehaviorSubject<Workspace>(null);
        this._haveWorkspacesLoaded = new BehaviorSubject<boolean>(false);
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

    // guessing these will be the various json templates that we define.
    // maybe load all from a folder? would have to parse JSON and read the ID and Name from each one.
    private loadWorkspaces() {
        const workspaces = [
            new Workspace("admin", "Developer workspace"),
            new Workspace("user", "Basic workspace"),
        ];

        console.log("loaded workspaces: ", workspaces);
        this._workspaces.next(List(workspaces));
        this._haveWorkspacesLoaded.next(true);
    }
}
