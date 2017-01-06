import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { AppModule } from "app/app.module";
import { AccountListComponent } from "app/components/account/browse";
import { AccountResource, Subscription } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import * as Fixtures from "test/fixture";
import { click } from "test/utils/helpers";
import { RxMockListProxy } from "test/utils/mocks";

describe("AccountListComponent", () => {
    let fixture: ComponentFixture<AccountListComponent>;
    let component: AccountListComponent;
    let de: DebugElement;
    let accountService: any;
    let subscriptionService: any;
    let subscriptionsElList: DebugElement[];

    beforeEach(() => {
        accountService = {
            list: (subId) => new RxMockListProxy<any, AccountResource>(AccountResource, {
                initialParams: { subscriptionId: subId },
                items: ({subscriptionId}) => {
                    switch (subscriptionId) {
                        case "sub-1":
                            return [
                                Fixtures.account.create({ id: "account-1", name: "Account 1", location: "westus" }),
                                Fixtures.account.create({ id: "account-2", name: "Account 2", location: "eastus" }),
                            ];
                        case "sub-2":
                            return [
                                Fixtures.account.create({ id: "account-3", name: "Account 3", location: "centralus" }),
                            ];
                        default:
                            return [];
                    }
                },
            }),
            isAccountFavorite: (accountId) => false,
        };

        subscriptionService = {
            list: () => new RxMockListProxy<{}, Subscription>(Subscription, {
                items: [
                    Fixtures.subscription.create({
                        id: "/subsccriptions/sub-1",
                        subscriptionId: "sub-1",
                        displayName: "My test subscription",
                    }),
                    Fixtures.subscription.create({
                        id: "/subsccriptions/sub-2",
                        subscriptionId: "sub-2",
                        displayName: "Someone test subscription",
                    }),
                    Fixtures.subscription.create({
                        id: "/subsccriptions/sub-3",
                        subscriptionId: "sub-3",
                        displayName: "His test subscription",
                    }),
                ],
            }),
        };

        TestBed.configureTestingModule({
            imports: [AppModule],
            providers: [
                { provide: SubscriptionService, useValue: subscriptionService },
                { provide: AccountService, useValue: accountService },
            ],
        });

        fixture = TestBed.createComponent(AccountListComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();

        subscriptionsElList = de.queryAll(By.css(".subscription"));
    });

    it("Should list all subscriptions sorted alphabetically", () => {
        expect(subscriptionsElList.length).toBe(3);
        expect(subscriptionsElList[0].nativeElement.textContent).toContain("sub-3");
        expect(subscriptionsElList[0].nativeElement.textContent).toContain("His test subscription");
        expect(subscriptionsElList[1].nativeElement.textContent).toContain("sub-1");
        expect(subscriptionsElList[1].nativeElement.textContent).toContain("My test subscription");
        expect(subscriptionsElList[2].nativeElement.textContent).toContain("sub-2");
        expect(subscriptionsElList[2].nativeElement.textContent).toContain("Someone test subscription");
    });

    it("should not show the account of a subscription by default", () => {
        const accountsEl = subscriptionsElList[0].query(By.css(".accounts"));
        expect(accountsEl).toBeNull();
    });

    it("should show batch account when clicking on a subscription", () => {
        click(subscriptionsElList[1].query(By.css(".subscription-details")));
        fixture.detectChanges();
        const accountsEl = subscriptionsElList[1].query(By.css(".accounts"));
        expect(accountsEl).not.toBeNull();

        const accountElList = accountsEl.queryAll(By.css("bex-quick-list-item"));
        expect(accountElList.length).toBe(2);

        expect(accountElList[0].nativeElement.textContent).toContain("Account 1");
        expect(accountElList[0].nativeElement.textContent).toContain("westus");
        expect(accountElList[1].nativeElement.textContent).toContain("Account 2");
        expect(accountElList[1].nativeElement.textContent).toContain("eastus");
    });

    it("expanding a subscription with no account show show no account message", () => {
        click(subscriptionsElList[0].query(By.css(".subscription-details")));
        fixture.detectChanges();

        const noItemEl = subscriptionsElList[0].query(By.css(".accounts .noitem"));
        expect(noItemEl).not.toBeNull();
        expect(noItemEl.nativeElement.textContent).toContain("No accounts in this subscription");
    });
});
