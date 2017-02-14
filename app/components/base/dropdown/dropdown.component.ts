import { Component, ElementRef, HostListener } from "@angular/core";

@Component({
    selector: "bex-dropdown",
    templateUrl: "dropdown.html",
})
export class DropdownComponent {

    public forcedOpen = false;
    public showDropdown = false;

    constructor(private elementRef: ElementRef) {

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
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.showDropdown = false;
            this.forcedOpen = false;
        }
    }

    public forceOpen() {
        this.forcedOpen = true;
        this.showDropdown = true;
    }
}
