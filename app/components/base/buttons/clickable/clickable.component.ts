import {
    Component, EventEmitter, HostBinding, HostListener,
    Inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, forwardRef,
} from "@angular/core";
import { Subscription } from "rxjs";

import { AuthorizationHttpService, Permission } from "app/services";
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
    public subtitle = "";

    private _sub: Subscription;
    private _permissionDisabled = false;

    constructor(@Inject(forwardRef(() => AuthorizationHttpService)) private authHttpService: AuthorizationHttpService) {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.permission) {
            this._clearSubscription();
            this._sub = this.authHttpService.hasPermission(this.permission).subscribe((hasPermission) => {
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
        if (this.isDisabled) {
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
