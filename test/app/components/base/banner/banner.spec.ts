import { Component, DebugElement, NO_ERRORS_SCHEMA, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
// import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";

import { BannerComponent, BannerOtherFixDirective } from "app/components/base/banner";
import { mouseenter } from "test/utils/helpers";

@Component({
    template: `
        <bl-banner #banner [fix]="fix1" fixMessage="Main fix" [type]="type">
            <div code>Error 404</div>
            <div message>Page not found</div>
            <div details *ngIf="includeDetails">You got to look carefully where you go</div>
            <div *ngIf="includeOtherFixes" [other-fix]="fix2" fixMessage="Second fix"></div>
            <div *ngIf="includeOtherFixes" [other-fix]="fix3" fixMessage="Third fix"></div>
        </bl-banner>
    `,
})
export class BannerTestComponent {
    @ViewChild("banner")
    public banner: BannerComponent;

    public includeDetails = true;
    public includeOtherFixes = false;
    public type = "error";

    public fix1: jasmine.Spy;
    public fix2: jasmine.Spy;
    public fix3: jasmine.Spy;
}

fdescribe("Banner", () => {
    let fixture: ComponentFixture<BannerTestComponent>;
    let component: BannerTestComponent;
    let bannerElement: DebugElement;
    let bannerComponent: BannerComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BannerComponent, BannerOtherFixDirective, BannerTestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(BannerTestComponent);
        component = fixture.componentInstance;
        component.fix1 = jasmine.createSpy("Fix 1");
        component.fix2 = jasmine.createSpy("Fix 2");
        component.fix3 = jasmine.createSpy("Fix 3");
        fixture.detectChanges();
        bannerElement = fixture.debugElement.query(By.css("bl-banner"));
        bannerComponent = bannerElement.componentInstance;
    });

    it("should be of error type by default", () => {
        expect(bannerComponent.type).toBe("error");
        expect(bannerElement.query(By.css("md-card")).nativeElement.className).toContain("error");
    });

    it("should be of warning type when changed", () => {
        component.type = "warning";
        fixture.detectChanges();
        expect(bannerComponent.type).toBe("warning");
        expect(bannerElement.query(By.css("md-card")).nativeElement.className).toContain("warning");
    });

    describe("When there is details", () => {
        it("should not show details by default(Until you click)", () => {
            expect(fixture.componentRef.instance.banner.showDetails).toBe(false);
        });

        it("should not show the more fixes button", () => {
            expect(bannerElement.query(By.css(".other-fixes-btn"))).toBeNull();
        });

        it("should not have the carret on facing left", () => {
            const carretEl = bannerElement.query(By.css(".caret"));
            expect(carretEl).not.toBe(null);
            expect(carretEl.classes["fa-caret-left"]).toBe(true);
            expect(carretEl.classes["fa-caret-down"]).toBe(false);
        });

        it("should show details after you click", () => {
            bannerElement.query(By.css(".summary-container")).nativeElement.click();
            expect(fixture.componentRef.instance.banner.showDetails).toBe(true);
        });

        it("carret change when you click", () => {
            bannerElement.query(By.css(".summary-container")).nativeElement.click();
            fixture.detectChanges();

            const carretEl = bannerElement.query(By.css(".caret"));
            expect(carretEl).not.toBe(null);
            expect(carretEl.classes["fa-caret-left"]).toBe(false);
            expect(carretEl.classes["fa-caret-down"]).toBe(true);
        });
    });

    describe("When there is no details", () => {
        beforeEach(() => {
            fixture.componentInstance.includeDetails = false;
            fixture.detectChanges();
        });

        it("should not have the carret", () => {
            const carretEl = bannerElement.query(By.css(".caret"));
            expect(carretEl).toBe(null);
        });

        it("clicking should not do anything", () => {
            bannerElement.query(By.css(".summary-container")).nativeElement.click();
            expect(fixture.componentRef.instance.banner.showDetails).toBe(false);
        });
    });

    describe("when there is other fixes", () => {
        beforeEach(() => {
            component.includeOtherFixes = true;
            fixture.detectChanges();
        });

        it("should show the more fixes button", () => {
            expect(bannerElement.query(By.css(".other-fixes-btn"))).not.toBeNull();
            expect(bannerElement.query(By.css(".other-fixes"))).toBeNull();
        });

        it("should list other fixes when mouse over the more fixes button", () => {
            mouseenter(bannerElement.query(By.css(".other-fixes-btn")));
            fixture.detectChanges();
            const otherFixesEl = bannerElement.query(By.css(".other-fixes"));
            expect(otherFixesEl).not.toBeNull();
            const els = otherFixesEl.queryAll(By.css(".other-fix"));
            expect(els.length).toBe(2);
            expect(els[0].nativeElement.textContent).toContain("Second fix");
            expect(els[1].nativeElement.textContent).toContain("Third fix");
        });
    });
});
