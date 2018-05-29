import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ElectronShell } from "@batch-flask/ui";
import { Observable } from "rxjs";

import { PoolErrorDisplayComponent } from "app/components/pool/details";
import { Pool, ResizeErrorCode } from "app/models";
import { AccountService, PoolService } from "app/services";
import * as Fixtures from "test/fixture";
import { BannerMockComponent } from "test/utils/mocks/components";

@Component({
    template: `<bl-pool-error-display [pool]="pool"></bl-pool-error-display>`,
})
class TestPoolErrorDisplayComponent {
    public pool: Pool;
}

describe("PoolErrorDisplayComponent", () => {
    let fixture: ComponentFixture<TestPoolErrorDisplayComponent>;
    let testComponent: TestPoolErrorDisplayComponent;
    let accountServiceSpy: any;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create()),
        };

        TestBed.configureTestingModule({
            declarations: [
                BannerMockComponent, PoolErrorDisplayComponent, TestPoolErrorDisplayComponent,
            ],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: PoolService, useValue: null },
                { provide: ElectronShell, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestPoolErrorDisplayComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe("when there is no error", () => {
        it("should not show anything", () => {
            expect(fixture.debugElement.query(By.css("bl-banner"))).toBeNull();
        });
    });

    describe("when there is a quota error", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({
                resizeErrors: [{
                    code: ResizeErrorCode.accountCoreQuotaReached,
                    message: "Reached account core quota",
                }],
            });
            fixture.detectChanges();
        });

        it("should show 1 bl banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bl-banner")).length).toBe(1);
        });

        it("Should show the code and message", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner"));
            expect(banner.nativeElement.textContent).toContain(ResizeErrorCode.accountCoreQuotaReached);
            expect(banner.nativeElement.textContent).toContain("Reached account core quota");
        });

        it("should propose increase quota as a first fix", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner")).componentInstance;
            expect(banner.fixMessage).toContain("Increase quota");
        });
    });

    describe("when there is a stop resizeError", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({
                resizeErrors: [{
                    code: ResizeErrorCode.resizeStopped,
                    message: "The resize was stopped",
                }],
            });
            fixture.detectChanges();
        });

        it("should show 1 bl banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bl-banner")).length).toBe(1);
        });

        it("Should show the code and message", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner"));
            expect(banner.nativeElement.textContent).toContain(ResizeErrorCode.resizeStopped);
            expect(banner.nativeElement.textContent).toContain("The resize was stopped");
        });

        it("should to rescale", () => {
            const banner = fixture.debugElement.query(By.css("bl-banner")).componentInstance;
            expect(banner.fixMessage).toContain("Rescale");
        });
    });
});
