import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { BehaviorSubject } from "rxjs";

import { ApplicationModule } from "app/components/application/application.module";
import { ApplicationErrorDisplayComponent } from "app/components/application/errors";
import { AccountResource, Application } from "app/models";
import { AccountService, ElectronShell } from "app/services";
import * as Fixtures from "test/fixture";

@Component({
    template: `<bl-application-error-display [application]="application"></bl-application-error-display>`,
})
class TestApplicationErrorDisplayComponent {
    public application: Application;
}

describe("ApplicationErrorDisplayComponent", () => {
    let fixture: ComponentFixture<TestApplicationErrorDisplayComponent>;
    let testComponent: TestApplicationErrorDisplayComponent;
    let component: ApplicationErrorDisplayComponent;
    let accountUnderTest: BehaviorSubject<AccountResource>;
    let accountServiceSpy: any;
    let shellSpy;

    beforeEach(() => {
        accountUnderTest = new BehaviorSubject<AccountResource>(Fixtures.account.create({
            id: "account-1",
            properties: {
                autoStorage: {
                    storageAccountId: "fake/accout/url",
                },
            },
        }));

        accountServiceSpy = {
            currentAccount: accountUnderTest,
        };

        shellSpy = {
            openItem: jasmine.createSpy("openItem"),
        };

        TestBed.configureTestingModule({
            imports: [ApplicationModule, RouterTestingModule],
            declarations: [TestApplicationErrorDisplayComponent],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: ElectronShell, useValue: shellSpy },
            ],
        });

        fixture = TestBed.createComponent(TestApplicationErrorDisplayComponent);
        testComponent = fixture.componentInstance;
        testComponent.application = Fixtures.application.create({ id: "app-1", allowUpdates: true });
        component = fixture.debugElement.query(By.css("bl-application-error-display")).componentInstance;
        fixture.detectChanges();
    });

    it("account is loaded", () => {
        expect(component.batchAccount).toBeDefined();
        expect(component.batchAccount.id).toEqual("account-1");
    });

    describe("when there is no error", () => {
        it("should not show anything", () => {
            expect(fixture.debugElement.query(By.css("bl-banner"))).toBeNull();
        });

        it("hasLinkedStorageAccountIssue is false", () => {
            expect(component.hasLinkedStorageAccountIssue).toEqual(false);
        });
    });

    describe("when batch account has an auto storage warning", () => {
        beforeEach(() => {
            accountUnderTest.next(Fixtures.account.create({
                id: "account-2",
                properties: {
                    autoStorage: null,
                },
            }));

            fixture.detectChanges();
        });

        it("hasLinkedStorageAccountIssue is true", () => {
            expect(component.hasLinkedStorageAccountIssue).toEqual(true);
        });

        it("should show 1 banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bl-banner")).length).toBe(1);
        });

        it("Should show auto storage warning", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner"));
            expect(banner.nativeElement.textContent)
                .toContain("No linked storage account configured for this Batch account. "
                    + "This is required for uploading application packages.");
        });

        it("should link to portal storage config as quickfix", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner")).componentInstance;
            expect(banner.fixMessage).toContain("Setup linked storage account in the portal");
        });
    });

    describe("when application allow updates is disabled", () => {
        beforeEach(() => {
            testComponent.application = Fixtures.application.create({ id: "app-1", allowUpdates: false });
            fixture.detectChanges();
        });

        it("should show 1 banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bl-banner")).length).toBe(1);
        });

        it("Should show account locked warning", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner"));
            expect(banner.nativeElement.textContent)
                .toContain("Package update and delete has been disabled. "
                    + "Turn on 'Allow updates' to enable for this application.");
        });

        it("there is no proposed quickfix", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner")).componentInstance;
            expect(banner.fixMessage).toEqual("");
        });
    });
});
