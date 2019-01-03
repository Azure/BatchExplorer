import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy } from "@angular/core";
import { I18nService } from "@batch-flask/core";
import { BatchAccountService } from "app/services";
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

    @HostBinding("attr.role") public readonly role = "navigation";
    @HostBinding("attr.aria-label") public get ariaLabel() {
        return this.i18n.translate("main-navigation.label");
    }

    private _accountSub: Subscription;

    constructor(
        accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef,
        private i18n: I18nService) {

        this._accountSub = accountService.currentAccountId.subscribe((accountId) => {
            this.selectedId = accountId;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy(): void {
        this._accountSub.unsubscribe();
    }
}
