import { Component, HostListener, Input } from "@angular/core";

import "./dropdown.scss";

@Component({
    selector: "bl-dropdown",
    templateUrl: "dropdown.html",
})
export class DropdownComponent {
    @Input() public footer: boolean = false;
    @Input() public align: "left" | "right" = "right";

    public forcedOpen = false;
    public showDropdown = false;

    public mouseEnter() {
        this.showDropdown = true;
    }

    public mouseLeave() {
        if (!this.forcedOpen) {
            this.showDropdown = false;
        }
    }

    @HostListener("document:click", ["$event"])
    public onClick(event: Event) {
        this.showDropdown = false;
        this.forcedOpen = false;
    }

    public forceOpen(event: Event) {
        this.forcedOpen = true;
        this.showDropdown = true;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
}
