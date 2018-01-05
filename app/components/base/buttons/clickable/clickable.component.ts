import {
    Component, EventEmitter, HostBinding, HostListener, Input,
    OnChanges, OnDestroy, Output, SimpleChanges,
} from "@angular/core";

import { AuthorizationHttpService } from "app/services";
import { Subscription } from "rxjs";
import "./clickable.scss";

@Component({
    selector: "bl-clickable",
    template: `<ng-content></ng-content>`,
})
export class ClickableComponent implements OnChanges, OnDestroy {
    @Input() @HostBinding("class.disabled") public disabled = false;

    @Output() public do = new EventEmitter<Event>();

    @HostBinding("tabindex") public tabindex = "0";
    @HostBinding("class.focus-outline") public focusOutline = true;
    public subtitle = "";
    private _sub: Subscription;
    public constructor(private authHttpService: AuthorizationHttpService) {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.subtitle = "";
        if (changes.permission) {
            this._clearSubscription();
            if (changes.permission.currentValue === "write") {
                this._sub = this.authHttpService.getResourcePermission().subscribe(permission => {
                    // when user only got 'read' permission
                    if (permission === "read") {
                        this.disabled = true;
                        this.tabindex = "-1";
                        this.subtitle = " (You don't have permission to perform this action)";
                    }
                });
            }
        }
    }

    public ngOnDestroy(): void {
        this._clearSubscription();
    }

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

    private _clearSubscription() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
