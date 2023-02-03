import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output,
} from "@angular/core";
import { I18nService } from "@batch-flask/core";

import "./dropdown.scss";

@Component({
    selector: "bl-dropdown",
    templateUrl: "dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
    @Input() public footer: boolean = false;
    @Input() public align: "left" | "right" = "right";

    @Output() public dblClick = new EventEmitter();

    public forcedOpen = false;
    public showDropdown = false;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private elementRef: ElementRef,
        private i18n: I18nService,
    ) { }

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
        if (this.showDropdown) {
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

    public dropdownButtonTitle() {
        const hostTitle = this.elementRef.nativeElement
            .querySelector("[bl-dropdown-btn")?.getAttribute("button-title");
        return hostTitle || this.i18n.t("dropdown.button-title");
    }

    public close() {
        this.showDropdown = false;
        this.changeDetector.markForCheck();
    }
}
