import { AccountService } from "../../../services";
import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";

import { SidebarManager } from "../../base/sidebar";
import { LoadingStatus } from "app/components/base/loading";
import { Account } from "app/models";
import { Property } from "app/utils/filter-builder";

// todo: can move the loading indicator to the common template when we can fire an event to turn it on and off

@Component({
    selector: "bex-account-list",
    template: require("./account-list.html"),
})
export class AccountListComponent {
    public searchQuery = new FormControl();
    public displayedAccounts: List<Account>;
    public status = LoadingStatus.Loading;

    @Input()
    public set filter(filter: Property) {
        this._filter = filter;

        this.accountService.accounts.subscribe((accounts) => {
            const query = filter.value;
            this.displayedAccounts = List<Account>(accounts.filter((x) => {
                return query === ""
                    || x.name.toLowerCase().startsWith(query)
                    || x.alias.toLowerCase().startsWith(query);
            }));
        });
    }
    public get filter(): Property { return this._filter; };

    private _filter: Property;

    constructor(
        private accountService: AccountService,
        private sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
        accountService.accounts.subscribe(() => {
            this.status = LoadingStatus.Ready;
        });

        this.searchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            query = query.toLowerCase();
            return accountService.accounts.subscribe((accounts) => {
                this.displayedAccounts = List<Account>(accounts.filter((x) => {
                    return query === ""
                        || x.name.toLowerCase().startsWith(query)
                        || x.alias.toLowerCase().startsWith(query);
                }));
            });
        });

        this.searchQuery.patchValue("");
    }
}
