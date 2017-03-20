import { fakeAsync, tick } from "@angular/core/testing";
import { AsyncSubject, Observable, Subscription } from "rxjs";

import { AccountResource } from "app/models";
import { AccountService } from "app/services";
import { DataCache } from "app/services/core";

describe("AccountService", () => {
    let accountService: AccountService;
    let currentAccount: AccountResource;
    let currentAccountId: string;
    let account1 = new AccountResource({ id: "account-1" });
    let subscriptionServiceSpy;
    let subs: Subscription[] = [];

    beforeEach(() => {
        subscriptionServiceSpy = {
            cache: new DataCache<any>(),
        };
        accountService = new AccountService({} as any, subscriptionServiceSpy);
        accountService.getAccount = jasmine.createSpy("getAccount").and.returnValue(Observable.of(account1));
        accountService.getAccountKeys = jasmine.createSpy("getAccountKeys").and.returnValue(Observable.of({}));
        subs.push(accountService.currentAccountId.subscribe(x => currentAccountId = x));
        subs.push(accountService.currentAccount.subscribe(x => currentAccount = x));
    });

    afterEach(() => {
        accountService = null;
        subs.forEach(x => x.unsubscribe());
    });

    /**
     * Note: If there is an error here that shown is in a completely different component(e.g. AccountListComponent)
     * It means that component has a subscription not being cleanup. Check ngOnDestroy cleanup all subscription started.
     */
    it("currentAccount should not return anything until a value has been loaded", () => {
        const accountSubscriptionSpy = jasmine.createSpy("currentAccount");
        accountService.currentAccount.first().subscribe(accountSubscriptionSpy);
        expect(accountSubscriptionSpy).not.toHaveBeenCalled();
        expect(currentAccount).toBeUndefined();

        accountService.selectAccount("account-1");
        expect(currentAccountId).toEqual("account-1", "Account id should have been updated immediately");
        expect(currentAccount).not.toBeUndefined();
        expect(currentAccount.id).toBe("account-1");
    });

    it("currentAccount should not return anything after selectAccount is called until done loading", fakeAsync(() => {
        accountService.selectAccount("account-1");
        expect(currentAccount).not.toBeUndefined();
        expect(currentAccount.id).toBe("account-1");

        let accountSubject = new AsyncSubject();
        accountService.getAccount = jasmine.createSpy("getOnce").and.returnValue(accountSubject);

        accountService.selectAccount("account-2");
        currentAccount = undefined;
        subs.push(accountService.currentAccount.subscribe((x) => currentAccount = x));
        expect(currentAccountId).toEqual("account-2", "Account id should have been updated immediately");
        expect(currentAccount).toBeUndefined();

        accountSubject.next(new AccountResource({ id: "account-2" }));
        accountSubject.complete();
        tick();

        expect(currentAccount).not.toBeUndefined();
        expect(currentAccount.id).toBe("account-2");
    }));
});
