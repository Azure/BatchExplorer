import {
    Component,
    ElementRef,
    HostListener,
    ViewEncapsulation,
} from "@angular/core";

import { SidebarManager } from "./sidebar-manager";
import { SidebarRef } from "./sidebar-ref";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "bex-sidebar-bookmarks",
    templateUrl: "sidebar-bookmarks.html",
})
export class SidebarBookmarksComponent {
    public showBookmarks = false;
    public leaveOpen = false;
    public references = [];

    constructor(private elementRef: ElementRef, public sidebarManager: SidebarManager) {
        sidebarManager.references.subscribe((x) => {
            this.references = x;
        });
    }

    public mouseEnter() {
        this.showBookmarks = true;
    }

    public mouseLeave() {
        if (!this.leaveOpen) {
            this.showBookmarks = false;
        }
    }

    public onClick() {
        this.showBookmarks = true;
        this.leaveOpen = true;
    }

    @HostListener("document:click", ["$event"])
    public onClickOutside(event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.leaveOpen = false;
            this.showBookmarks = false;
        }
    }

    public selectBookmark(reference: SidebarRef<any>) {
        reference.reopen();
        // Make sure we close the dropdown
        this.closeDropdown();
    }

    public destroyBookmark(reference: SidebarRef<any>) {
        reference.destroy();
        // Make sure we close the dropdown
        this.closeDropdown();
    }

    private closeDropdown() {
        this.leaveOpen = false;
        this.showBookmarks = false;
    }
}
