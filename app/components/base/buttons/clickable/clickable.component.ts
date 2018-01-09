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
    /**
     * Set this to false to disable the button because its an invalid action at the time
     */
    @Input() public disabled = false;

    /**
     * Optional requirement to be able to access this button
     */
    @Input() public permission?: Permission;

    /**
     * @returns true if either the disabled attribute is set to true or there is no permission for this action
     */
    @HostBinding("class.disabled") public get isDisabled() { return this.disabled || this._permissionDisabled; }
    @Output() public do = new EventEmitter<Event>();
    @HostBinding("tabindex") public tabindex = "0";
    @HostBinding("class.focus-outline") public focusOutline = true;
    public subtitle = "";

    private _sub: Subscription;
    private _permissionDisabled = false;

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
                            this._permissionDisabled = true;
                            this.subtitle = " (You don't have permission to perform this action)";
                            break;
                        case Permission.Write:
                            this._permissionDisabled = false;
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
