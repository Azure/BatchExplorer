import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { PoolDetailsModule, PoolErrorDisplayComponent } from "app/components/pool/details";
import { Pool, ResizeErrorCode } from "app/models";
import { AccountService, PoolService } from "app/services";
import * as Fixtures from "test/fixture";

@Component({
    template: `<bl-pool-error-display [pool]="pool"></bl-pool-error-display>`,
})
class TestPoolErrorDisplayComponent {
    public pool: Pool;
}

describe("PoolErrorDisplayComponent", () => {
    let fixture: ComponentFixture<TestPoolErrorDisplayComponent>;
    let testComponent: TestPoolErrorDisplayComponent;
    let component: PoolErrorDisplayComponent;
    let accountServiceSpy: any;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create()),
        };
        TestBed.configureTestingModule({
            imports: [PoolDetailsModule],
            declarations: [TestPoolErrorDisplayComponent],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: PoolService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestPoolErrorDisplayComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bl-pool-error-display")).componentInstance;
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
                resizeError: {
                    code: ResizeErrorCode.accountCoreQuotaReached,
                    message: "Reached account core quota",
                },
            });
            fixture.detectChanges();
        });

        it("should have a resize error", () => {
            expect(component.hasResizeError).toBe(true);
        });

        it("should have a quota error", () => {
            expect(component.hasQuotaReachedError).toBe(true);
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
                resizeError: {
                    code: ResizeErrorCode.resizeStopped,
                    message: "The resize was stopped",
                },
            });
            fixture.detectChanges();
        });

        it("should have a resize error", () => {
            expect(component.hasResizeError).toBe(true);
        });

        it("should NOT have a quota error", () => {
            expect(component.hasQuotaReachedError).toBe(false);
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
