import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
} from "@angular/core";
import { MouseButton } from "@batch-flask/core";
import { Subscription } from "rxjs";

import { SidebarManager } from "../sidebar-manager";
import { SidebarRef } from "../sidebar-ref";

import "./sidebar-bookmarks.scss";

@Component({
    selector: "bl-sidebar-bookmarks",
    templateUrl: "sidebar-bookmarks.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarBookmarksComponent implements OnDestroy {
    public references: Array<SidebarRef<any>> = [];

    private _sub: Subscription;

    constructor(public sidebarManager: SidebarManager, private changeDetector: ChangeDetectorRef) {
        this._sub = sidebarManager.references.subscribe((x) => {
            this.references = x;
            this.changeDetector.markForCheck();
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

    public handleMouseUp(event: MouseEvent, reference: SidebarRef<any>) {
        if (event.button === MouseButton.middle) {
            reference.destroy();
        }
    }

    public referenceTitle(reference: SidebarRef<any>) {
        const title = reference.component.title;
        if (title) {
            return title;
        } else {
            return reference.id;
        }
    }
}
