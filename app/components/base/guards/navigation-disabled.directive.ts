import { Directive, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { AccountService } from "app/services";

@Directive({
    selector: "[blNavigationDisabled]",
})
export class NavigationDisabledDirective implements OnInit  {
    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private accountService: AccountService,
    ) {
    }

    public ngOnInit() {
        this.accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            } else {
                this.viewContainer.clear();
            }
        });
    }
}
