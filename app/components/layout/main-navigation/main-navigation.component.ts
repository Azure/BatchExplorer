import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { AccountService } from "app/services";

import { Subscription } from "rxjs";
import "./main-navigation.scss";

@Component({
    selector: "bl-app-nav",
    templateUrl: "main-navigation.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavigationComponent implements OnDestroy {

    public selectedAccountAlias: string;
    public selectedId: string;

    private _accountSub: Subscription;

    constructor(accountService: AccountService, private changeDetector: ChangeDetectorRef) {
        this._accountSub = accountService.currentAccountId.subscribe((accountId) => {
            this.selectedId = accountId;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy(): void {
        this._accountSub.unsubscribe();
    }
}
