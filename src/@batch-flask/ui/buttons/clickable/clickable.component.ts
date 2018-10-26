import {
    Component,
    EventEmitter,
    HostBinding,
    HostListener,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    Self,
    SimpleChanges,
} from "@angular/core";
import { MatMenuTrigger } from "@angular/material";
import { RouterLink } from "@angular/router";
import { ENTER, SPACE } from "@batch-flask/core/keys";
import { Permission, PermissionService } from "@batch-flask/ui/permission";
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
    @HostBinding("tabindex") public get tabindex() {
        return this.isDisabled ? "-1" : "0";
    }
    @HostBinding("class.focus-outline") public focusOutline = true;

    // Aria
    @Input() @HostBinding("attr.role") public role = "button";
    @HostBinding("attr.aria-disabled") public get ariaDisabled() { return this.disabled; }

    public subtitle = "";

    private permissionService?: PermissionService;
    private _matMenuTrigger?: MatMenuTrigger;
    // Router link directive if any
    private _routerLink?: RouterLink;
    private _sub: Subscription;
    private _permissionDisabled = false;

    constructor(injector: Injector, @Self() @Optional() routerLink: RouterLink) {
        this._routerLink = routerLink;
        this._matMenuTrigger = injector.get(MatMenuTrigger, null, 2);
        this.permissionService = injector.get(PermissionService, null);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.permission) {
            this._clearSubscription();
            this._sub = this.permissionService.hasPermission(this.permission).subscribe((hasPermission) => {
                this._permissionDisabled = !hasPermission;
                if (hasPermission) {
                    this.subtitle = "";
                } else {
                    this.subtitle = " (You don't have permission to perform this action)";
                }
            });
        }
    }

    public ngOnDestroy(): void {
        this._clearSubscription();
    }

    @HostListener("click", ["$event"])
    public handleClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.handleAction(event);
    }

    @HostListener("keydown", ["$event"])
    public onkeydown(event: KeyboardEvent) {
        if (event.key === SPACE || event.key === ENTER) {
            this.handleAction(event);
            event.preventDefault();
        }
    }

    public handleAction(event: Event) {
        if (this.isDisabled) {
            event.stopImmediatePropagation();
            return;
        }
        this.do.emit(event);

        if (this._routerLink) {
            this._routerLink.onClick();
        }
        if (this._matMenuTrigger) {
            this._matMenuTrigger.openMenu();
        }
    }

    private _clearSubscription() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
