import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Router, RouterStateSnapshot } from "@angular/router";
import { DialogService } from "@batch-flask/ui";
import { BatchAccountService } from "app/services";
import { of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { SelectAccountDialogComponent } from "./select-acccount-dialog";

@Injectable()
export class RequireActiveBatchAccountGuard implements CanActivate, CanLoad {
    constructor(
        private accountService: BatchAccountService,
        private dialogService: DialogService,
        private router: Router,
    ) {
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.accountService.currentAccountId.pipe(
            switchMap((accountId) => {
                if (accountId) { return of(true); }
                const ref = this.dialogService.open(SelectAccountDialogComponent);
                return ref.beforeClosed().pipe(
                    map((pickedAccountId) => {
                        if (pickedAccountId) {
                            return true;
                        } else {
                            return this.router.createUrlTree(["/accounts"]);
                        }
                    }),
                );
            }),
        );
    }

    public canLoad() {
        return true;
    }
}
