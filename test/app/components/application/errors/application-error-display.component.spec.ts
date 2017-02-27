import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable } from "rxjs";

import { ApplicationModule } from "app/components/application/application.module";
import { ApplicationErrorDisplayComponent } from "app/components/application/errors";
import { AccountService, ElectronShell } from "app/services";
import * as Fixtures from "test/fixture";

fdescribe("ApplicationErrorDisplayComponent", () => {
    let fixture: ComponentFixture<ApplicationErrorDisplayComponent>;
    let component: ApplicationErrorDisplayComponent;
    let accountServiceSpy: any;
    let shellSpy;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create({
                id: "account-1",
                properties: {
                    autoStorage: {
                        storageAccountId: "fake/accout/url",
                    },
                },
            })),
        };

        shellSpy = {
            openItem: jasmine.createSpy("openItem"),
        };

        TestBed.configureTestingModule({
            imports: [ApplicationModule, RouterTestingModule],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: ElectronShell, useValue: shellSpy },
            ],
        });

        fixture = TestBed.createComponent(ApplicationErrorDisplayComponent);
        component = fixture.componentInstance;
        component.application = Fixtures.application.create({ id: "app-1", allowUpdates: true });
        fixture.detectChanges();
    });

    it("account is loaded", () => {
        const anyBatchAccount = (<any>component)._batchAccount;
        expect(anyBatchAccount).toBeDefined();
        expect(anyBatchAccount.id).toEqual("account-1");
    });

    describe("when there is no error", () => {
        it("should not show anything", () => {
            expect(fixture.debugElement.query(By.css("bl-banner"))).toBeNull();
        });

        it("hasLinkedStorageAccountIssue is true", () => {
            expect(component.hasLinkedStorageAccountIssue).toEqual(false);
        });
    });

    describe("when batch account has an auto storage warning", () => {
        beforeEach(() => {
            (<any>component)._batchAccount = Fixtures.account.create({
                id: "account-1",
                properties: {
                    autoStorage: {
                        storageAccountId: "fake/accout/url",
                    },
                },
            });

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
            expect(banner.nativeElement.textContent).toContain("No linked storage account configured for this Batch account. This is required for uploading application packages.");
        });

        it("should propose to list failed task as quickfix", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner")).componentInstance;
            expect(banner.fixMessage).toContain("Setup linked storage account in the portal");
        });
    });

    // describe("when application allow updates is disabled", () => {
    //     beforeEach(() => {
    //         component.application = Fixtures.application.create({ id: "app-1", allowUpdates: false });
    //         fixture.detectChanges();
    //     });

    //     it("should show 1 banner", () => {
    //         expect(fixture.debugElement.queryAll(By.css("bl-banner")).length).toBe(1);
    //     });

    //     it("Should show account locked warning", () => {
    //         const banner = fixture.debugElement.query(By.css("bl-banner"));
    //         expect(banner.nativeElement.textContent).toContain("Package update and delete has been disabled. Turn on 'Allow updates' to enable for this application.");
    //     });

    //     it("there is no proposed quickfix", () => {
    //         const banner = fixture.debugElement.query(By.css("bl-banner")).componentInstance;
    //         expect(banner.fixMessage).toEqual("");
    //     });
    // });
});
