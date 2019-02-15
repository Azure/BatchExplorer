import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { DialogService } from "@batch-flask/ui";
import { BatchAccountService } from "app/services";
import { of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { SelectAccountDialogComponent } from "./select-acccount-dialog";

@Injectable()
export class RequireActiveBatchAccountGuard implements CanActivate {
    constructor(
        private accountService: BatchAccountService,
        private dialogService: DialogService,
    ) {
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.accountService.currentAccountId.pipe(
            switchMap((accountId) => {
                if (accountId) { return of(true); }
                const ref = this.dialogService.open(SelectAccountDialogComponent);
                return ref.afterClosed().pipe(
                    map(x => x !== null),
                );
            }),
        );
    }
}
