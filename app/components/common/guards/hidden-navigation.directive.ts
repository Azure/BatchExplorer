import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subscription } from "rxjs";

import { AccountService } from "app/services";

@Directive({
    selector: "[blHiddenIfNoAccount]",
})
export class HiddenIfNoAccountDirective implements OnInit, OnDestroy  {
    private _subscription: Subscription;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private accountService: AccountService,
    ) {
    }

    public ngOnInit() {
        this._subscription = this.accountService.currentAccountId.subscribe((accountId) => {
            this.viewContainer.clear();
            if (accountId) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            }
        });
    }

    public ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}
