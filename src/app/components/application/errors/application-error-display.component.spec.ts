import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BehaviorSubject } from "rxjs";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { ApplicationErrorDisplayComponent } from "app/components/application/errors";
import { BatchAccount, BatchApplication } from "app/models";
import { BatchAccountService } from "app/services";
import * as Fixtures from "test/fixture";
import { BannerMockComponent } from "test/utils/mocks/components";

@Component({
    template: `<bl-application-error-display [application]="application"></bl-application-error-display>`,
})
class TestApplicationErrorDisplayComponent {
    public application: BatchApplication;
}

describe("ApplicationErrorDisplayComponent", () => {
    let fixture: ComponentFixture<TestApplicationErrorDisplayComponent>;
    let testComponent: TestApplicationErrorDisplayComponent;
    let component: ApplicationErrorDisplayComponent;
    let accountUnderTest: BehaviorSubject<BatchAccount>;
    let accountServiceSpy: any;
    let sidebarSpy;

    beforeEach(() => {
        accountUnderTest = new BehaviorSubject<BatchAccount>(Fixtures.account.create({
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

        sidebarSpy = {
            open: jasmine.createSpy("open"),
        };

        TestBed.configureTestingModule({
            declarations: [ApplicationErrorDisplayComponent, BannerMockComponent, TestApplicationErrorDisplayComponent],
            providers: [
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: SidebarManager, useValue: sidebarSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestApplicationErrorDisplayComponent);
        testComponent = fixture.componentInstance;
        testComponent.application = Fixtures.application.create({ id: "app-1", properties: { allowUpdates: true } });
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
            expect(banner.fixMessage).toContain("Setup linked storage account");
        });
    });

    describe("when application allow updates is disabled", () => {
        beforeEach(() => {
            testComponent.application = Fixtures.application.create({
                id: "app-1",
                properties: { allowUpdates: false },
            });
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
