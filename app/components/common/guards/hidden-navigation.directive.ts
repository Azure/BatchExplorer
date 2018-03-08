import { Directive, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { AccountService } from "app/services";

@Directive({
    selector: "[blHiddenIfNoAccount]",
})
export class HiddenIfNoAccountDirective implements OnInit  {
    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private accountService: AccountService,
    ) {
    }

    public ngOnInit() {
        this.accountService.currentAccountId.subscribe((accountId) => {
            this.viewContainer.clear();
            if (accountId) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            }
        });
    }
}
