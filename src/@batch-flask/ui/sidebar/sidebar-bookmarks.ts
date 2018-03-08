import {
    Component,
    OnDestroy,
    ViewEncapsulation,
} from "@angular/core";
import { Subscription } from "rxjs";

import { SidebarManager } from "./sidebar-manager";
import { SidebarRef } from "./sidebar-ref";

import "./sidebar-bookmarks.scss";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "bl-sidebar-bookmarks",
    templateUrl: "sidebar-bookmarks.html",
})
export class SidebarBookmarksComponent implements OnDestroy {
    public references = [];

    private _sub: Subscription;

    constructor(public sidebarManager: SidebarManager) {
        this._sub = sidebarManager.references.subscribe((x) => {
            this.references = x;
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public selectBookmark(reference: SidebarRef<any>) {
        reference.reopen();
    }

    public destroyBookmark(reference: SidebarRef<any>) {
        reference.destroy();
    }

    public trackReference(index, reference: SidebarRef<any>) {
        return reference.id;
    }
}
