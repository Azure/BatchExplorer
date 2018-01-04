import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding,
    Input, OnChanges, OnDestroy, SimpleChanges, animate, style, transition, trigger,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { BatchAccountPermission, RoleDefinitionPermission } from "app/models";
import { AccountService, ArmHttpService } from "app/services";
import { log } from "app/utils";
import "./button.scss";
import { ClickableComponent } from "./clickable";

export type ButtonType = "square" | "round" | "wide" | "plain";
export type ButtonColor = "primary" | "light" | "danger" | "warn" | "success";
export type ButtonAction = (event?: Event) => Observable<any> | void;

export enum SubmitStatus {
    Idle,
    Submitting,
    Succeeded,
    Failed,
}

@Component({
    selector: "bl-button",
    templateUrl: "button.html",
    animations: [
        trigger("animateSucessIcon", [
            transition(":enter", [
                style({ width: 0 }),
                animate("200ms", style({ width: "1em" })),
            ]),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ButtonComponent extends ClickableComponent implements OnChanges, OnDestroy {
    public SubmitStatus = SubmitStatus;

    @Input() public action: ButtonAction;
    @Input() public icon: string;
    @Input() public title: string;
    @Input() public tooltipPosition: string = "above";
    @Input() public enforcePermission?: boolean;

    /**
     * If set to true the check mark animation will not be shown
     */
    @Input() public skipSuccess: boolean = false;
    @Input() @HostBinding("attr.type") public type: ButtonType = "square";
    @Input() @HostBinding("attr.color") public color: ButtonColor = "primary";
    @Input() public routerLink: string;

    public set status(value: SubmitStatus) {
        this._status = value;
        this.changeDetectionRef.markForCheck();
    }

    public get status() { return this._status; }
    private _status = SubmitStatus.Idle;
    private _accountSub: Subscription;
    private _permissionSub: Subscription;

    constructor(private accountService: AccountService,
                private armService: ArmHttpService,
                private changeDetectionRef: ChangeDetectorRef) {
        super();
    }

    public handleAction(event: Event) {
        super.handleAction(event);
        if (this.disabled || !this.action) {
            return;
        }
        this._execute(event);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if ("disabled" in changes) {
            this.tabindex = this.disabled ? "-1" : "0";
        }
        if ("enforcePermission" in changes) {
            this._destorySubscriptions();
            this._accountSub = this.accountService.currentAccount.subscribe(account => {
                const resourceId = account && account.id;
                if (resourceId) {
                    const url = this.armService.getPermissionUrl(resourceId);
                    this._permissionSub = this.armService.recursiveRequest(url).subscribe((result) => {
                        const permissions = result.json().value;
                        this._checkButtonPermissions(permissions);
                    });
                }
            });
        }
    }

    public ngOnDestroy(): void {
        this._destorySubscriptions();
    }

    public done() {
        setTimeout(() => {
            this.status = SubmitStatus.Idle;
        }, 700);
    }

    private _execute(event: Event) {
        this.status = SubmitStatus.Submitting;

        const obs = this.action(event);
        if (!obs) {
            if (this.skipSuccess) {
                this.status = SubmitStatus.Idle;
            } else {
                this.status = SubmitStatus.Succeeded;
                this.done();
            }
            return;
        }
        obs.subscribe({
            complete: () => {
                this.status = SubmitStatus.Succeeded;
                this.done();
            },
            error: (e) => {
                log.error("Error while executing button action", e);
                this.status = SubmitStatus.Failed;
                this.done();
            },
        });
    }

    private _checkButtonPermissions(permissions: RoleDefinitionPermission[]) {
        for (let permission of permissions) {
            if (permission.actions) {
                // If user only has 'Reader' role without any 'Write' role, button should be disabled
                // Note that user could be assigned to multiple roles at same time (Reader, Owner, Contributor),
                // in this case, permission should be checked from highest to lowest
                if (!permission.actions.includes(BatchAccountPermission.ReadWrite)
                    && permission.actions.includes(BatchAccountPermission.Read)) {
                    this.disabled = true;
                    this.tabindex = "-1";
                    this.title += " (You don't have permission to perform this action)";
                }
            }
        }
    }

    private _destorySubscriptions() {
        if (this._accountSub) {
            this._accountSub.unsubscribe();
        }

        if (this._permissionSub) {
            this._permissionSub.unsubscribe();
        }
    }
}

@Component({
    selector: "bl-button-group",
    template: `
        <ng-content></ng-content>
    `,
})
export class ButtonGroupComponent {
}
