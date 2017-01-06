import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable, Subject } from "rxjs";

import { AppModule } from "app/app.module";
import { CreateFormComponent } from "app/components/base/form/create-form";
import { SidebarRef } from "app/components/base/sidebar";
import { AccountListComponent } from "app/components/account/browse";
import { AccountResource, Subscription } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import { DataCache, RxBatchListProxy } from "app/services/core";
import { ComponentTestHelper } from "test/app/components/component-test-helper";
import * as Fixtures from "test/fixture";
import { RxMockListProxy } from "test/utils/mocks";


fdescribe("AccountListComponent", () => {
    let fixture: ComponentFixture<AccountListComponent>;
    let component: AccountListComponent;
    let de: DebugElement;
    let accountService: any;
    let subscriptionService: any;

    beforeEach(() => {
        accountService = {
            list: () => new RxMockListProxy<any, AccountResource>(AccountResource, {
                items: [],
            }),
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
    });

    it("Should list all subscriptions sorted alphabetically", () => {
        const subscriptionsElList = de.queryAll(By.css(".subscription"));
        expect(subscriptionsElList.length).toBe(3);
        expect(subscriptionsElList[0].nativeElement.textContent).toContain("sub-3");
        expect(subscriptionsElList[0].nativeElement.textContent).toContain("His test subscription");
        expect(subscriptionsElList[1].nativeElement.textContent).toContain("sub-1");
        expect(subscriptionsElList[1].nativeElement.textContent).toContain("My test subscription");
        expect(subscriptionsElList[2].nativeElement.textContent).toContain("sub-2");
        expect(subscriptionsElList[2].nativeElement.textContent).toContain("Someone test subscription");
    });

});
