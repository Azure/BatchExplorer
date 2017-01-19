import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { PoolDetailsModule, PoolErrorDisplayComponent } from "app/components/pool/details";
import { Pool, ResizeErrorCode } from "app/models";
import { AccountService, PoolService } from "app/services";
import * as Fixtures from "test/fixture";

describe("PoolErrorDisplayComponent", () => {
    let fixture: ComponentFixture<PoolErrorDisplayComponent>;
    let component: PoolErrorDisplayComponent;
    let accountServiceSpy: any;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create()),
        };
        TestBed.configureTestingModule({
            imports: [PoolDetailsModule],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: PoolService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(PoolErrorDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe("when there is no error", () => {
        it("should not show anything", () => {
            expect(fixture.debugElement.query(By.css("bex-banner"))).toBeNull();
        });
    });

    describe("when there is a quota error", () => {
        beforeEach(() => {
            component.pool = new Pool({
                resizeError: {
                    code: ResizeErrorCode.accountCoreQuotaReached,
                    message: "Reached account core quota",
                },
            });
            fixture.detectChanges();
        });

        it("should show 1 bex banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bex-banner")).length).toBe(1);
        });

        it("Should show the code and message", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner"));
            expect(banner.nativeElement.textContent).toContain(ResizeErrorCode.accountCoreQuotaReached);
            expect(banner.nativeElement.textContent).toContain("Reached account core quota");
        });

        it("should propose increase quota as a first fix", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner")).componentInstance;
            expect(banner.fixMessage).toContain("Increase quota");
        });
    });
    describe("when there is a stop resizeError", () => {
        beforeEach(() => {
            component.pool = new Pool({
                resizeError: {
                    code: ResizeErrorCode.resizeStopped,
                    message: "The resize was stopped",
                },
            });
            fixture.detectChanges();
        });

        it("should show 1 bex banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bex-banner")).length).toBe(1);
        });

        it("Should show the code and message", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner"));
            expect(banner.nativeElement.textContent).toContain(ResizeErrorCode.resizeStopped);
            expect(banner.nativeElement.textContent).toContain("The resize was stopped");
        });

        it("should to rescale", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner")).componentInstance;
            expect(banner.fixMessage).toContain("Rescale");
        });
    });
});
