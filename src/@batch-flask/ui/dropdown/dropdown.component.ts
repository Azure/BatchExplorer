import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input } from "@angular/core";

import "./dropdown.scss";

@Component({
    selector: "bl-dropdown",
    templateUrl: "dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
    @Input() public footer: boolean = false;
    @Input() public align: "left" | "right" = "right";

    public forcedOpen = false;
    public showDropdown = false;

    constructor(private changeDetector: ChangeDetectorRef) { }
    public mouseEnter() {
        this.showDropdown = true;
        this.changeDetector.markForCheck();
    }

    public mouseLeave() {
        if (!this.forcedOpen) {
            this.showDropdown = false;
            this.changeDetector.markForCheck();
        }
    }

    @HostListener("document:click", ["$event"])
    public onClick(event: Event) {
        this.showDropdown = false;
        this.forcedOpen = false;
    }

    public toggleForceOpen(event: Event) {
        if(this.showDropdown) {
            this.close();
        } else {
            this.forcedOpen = true;
            this.showDropdown = true;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            this.changeDetector.markForCheck();
        }
    }

    public close() {
        this.showDropdown = false;
        this.changeDetector.markForCheck();
    }
}
