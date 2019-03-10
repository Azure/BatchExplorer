import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { BatchAccountService } from "app/services";
import { Subscription } from "rxjs";

@Directive({
    selector: "[blHiddenIfNoAccount]",
})
export class HiddenIfNoAccountDirective implements OnInit, OnDestroy  {
    private _subscription: Subscription;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private accountService: BatchAccountService,
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
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
}
