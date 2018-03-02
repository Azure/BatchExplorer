import { Observable, Subject } from "rxjs";

import { SidebarManager } from "./sidebar-manager";
import { SidebarPageComponent } from "./sidebar-page";

export class SidebarRef<T> {
    public component: T;
    public page: SidebarPageComponent;
    public afterCompletion: Observable<any>;

    private _afterCompletion: Subject<any> = new Subject();

    constructor(private sidebarManager: SidebarManager, public id: string) {
        this.afterCompletion = this._afterCompletion.asObservable();
    }

    public reopen() {
        this.sidebarManager.reopen(this);
    }

    /**
     * Complete
     */
    public destroy(result?: any) {
        this.sidebarManager.destroy(this);
        this._afterCompletion.next(result);
        this._afterCompletion.complete();
    }
}
