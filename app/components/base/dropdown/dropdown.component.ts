import { Component, ElementRef, HostListener } from "@angular/core";

@Component({
    selector: "bl-dropdown",
    templateUrl: "dropdown.html",
})
export class DropdownComponent {

    public forcedOpen = false;
    public showDropdown = false;

    constructor(elementRef: ElementRef) {

    }
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
