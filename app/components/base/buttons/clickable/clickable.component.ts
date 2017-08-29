import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from "@angular/core";

@Component({
    selector: "bl-clickable",
    template: `<ng-content></ng-content>`,
})
export class ClickableComponent {
    @Input() @HostBinding("class.disabled") public disabled = false;

    @Output() public do = new EventEmitter<Event>();

    @HostBinding("tabindex") public tabindex = "0";

    @HostListener("click", ["$event"])
    public handleClick(event: Event) {
        this.handleAction(event);
    }

    @HostListener("keydown", ["$event"])
    public onkeydown(event: KeyboardEvent) {
        if (event.code === "Space" || event.code === "Enter") {
            this.handleAction(event);
            event.preventDefault();
        }
    }

    public handleAction(event: Event) {
        if (this.disabled) {
            return;
        }
        this.do.emit(event);
    }
}
