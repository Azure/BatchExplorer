import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { AccountService } from "app/services";

@Injectable()
export class NavigationGuard implements CanActivate  {
    constructor(
        // private router: Router,
        private accountService: AccountService,
    ) {
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.accountService.currentAccountId.map((accountId) => {
            console.log(accountId);
            return !!accountId;
        });
    }
}
