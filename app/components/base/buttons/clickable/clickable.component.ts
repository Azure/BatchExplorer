import {
    Component, EventEmitter, HostBinding, HostListener,
    Input, OnChanges, OnDestroy, Output, SimpleChanges,
} from "@angular/core";

import { AuthorizationHttpService, Permission } from "app/services";
import { Subscription } from "rxjs";
import "./clickable.scss";

@Component({
    selector: "bl-clickable",
    template: `<ng-content></ng-content>`,
})
export class ClickableComponent implements OnChanges, OnDestroy {
    @Input() @HostBinding("class.disabled") public disabled = false;
    @Input() public permission?: Permission;
    @Output() public do = new EventEmitter<Event>();
    @HostBinding("tabindex") public tabindex = "0";
    @HostBinding("class.focus-outline") public focusOutline = true;
    public subtitle = "";

    private _sub: Subscription;

    constructor(private authHttpService: AuthorizationHttpService) {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.permission) {
            this._clearSubscription();
            this._sub = this.authHttpService.getResourcePermission().subscribe((userPermission: Permission) => {
                if (this.permission === Permission.Write) {
                    switch (userPermission) {
                        case Permission.None:
                        case Permission.Read:
                            this.disabled = true;
                            this.tabindex = "-1";
                            this.subtitle = " (You don't have permission to perform this action)";
                            break;
                        case Permission.Write:
                            this.disabled = ("disabled" in changes);
                            this.tabindex = this.disabled ? "-1" : "0";
                            this.subtitle = "";
                            break;
                    }
                }
            });
        }
        this.tabindex = this.disabled ? "-1" : "0";
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
