import { Observable, Subject } from "rxjs";

import { SidebarManager } from "./sidebar-manager";
import { SidebarPageComponent } from "./sidebar-page";

export class SidebarRef<T> {
    public component: T;
    public page: SidebarPageComponent;

    public afterCompletition: Observable<any>;

    private _afterCompletition: Subject<any> = new Subject();

    constructor(private sidebarManager: SidebarManager, public id: string) {
        this.afterCompletition = this._afterCompletition.asObservable();
    }

    public reopen() {
        this.sidebarManager.reopen(this);
    }

    /**
     * Complete
     */
    public destroy(result?: any) {
        this.sidebarManager.destroy(this);
        this._afterCompletition.next(result);
        this._afterCompletition.complete();
    }
}
