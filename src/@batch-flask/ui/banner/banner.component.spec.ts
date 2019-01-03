import { Component, DebugElement, NO_ERRORS_SCHEMA, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { AsyncSubject } from "rxjs";

import { BannerComponent, BannerOtherFixDirective } from "@batch-flask/ui/banner";
import { mouseenter } from "test/utils/helpers";
import { ClickableComponent } from "../buttons";

@Component({
    template: `
        <bl-banner #banner [fix]="fix1" fixMessage="Main fix" [type]="type" [id]="bannerId">
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

    public bannerId = "id-1";

    public fix1: jasmine.Spy;
    public fix2: jasmine.Spy;
    public fix3: jasmine.Spy;
}

describe("BannerComponent", () => {
    let fixture: ComponentFixture<BannerTestComponent>;
    let testComponent: BannerTestComponent;
    let de: DebugElement;
    let component: BannerComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BannerComponent, BannerOtherFixDirective, BannerTestComponent, ClickableComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(BannerTestComponent);
        testComponent = fixture.componentInstance;
        testComponent.fix1 = jasmine.createSpy("Fix 1");
        testComponent.fix2 = jasmine.createSpy("Fix 2");
        testComponent.fix3 = jasmine.createSpy("Fix 3");
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css("bl-banner"));
        component = de.componentInstance;
    });

    it("should be of error type by default", () => {
        expect(component.type).toBe("error");
        expect(de.query(By.css("bl-card")).nativeElement.className).toContain("error");
    });

    it("should be of warning type when changed", () => {
        testComponent.type = "warning";
        fixture.detectChanges();
        expect(component.type).toBe("warning");
        expect(de.query(By.css("bl-card")).nativeElement.className).toContain("warning");
    });

    describe("When there is details", () => {
        it("should not show details by default(Until you click)", () => {
            expect(fixture.componentRef.instance.banner.showDetails).toBe(false);
        });

        it("should not show the more fixes button", () => {
            expect(de.query(By.css(".other-fixes-btn"))).toBeNull();
        });

        it("should not have the carret on facing left", () => {
            const carretEl = de.query(By.css(".caret"));
            expect(carretEl).not.toBe(null);
            expect(carretEl.classes["fa-caret-left"]).toBe(true);
            expect(carretEl.classes["fa-caret-down"]).toBe(false);
        });

        it("should show details after you click", () => {
            de.query(By.css(".summary-container")).nativeElement.click();
            expect(fixture.componentRef.instance.banner.showDetails).toBe(true);
        });

        it("carret change when you click", () => {
            de.query(By.css(".summary-container")).nativeElement.click();
            fixture.detectChanges();

            const carretEl = de.query(By.css(".caret"));
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
            const carretEl = de.query(By.css(".caret"));
            expect(carretEl).toBe(null);
        });

        it("clicking should not do anything", () => {
            de.query(By.css(".summary-container")).nativeElement.click();
            expect(fixture.componentRef.instance.banner.showDetails).toBe(false);
        });
    });

    describe("when there is other fixes", () => {
        beforeEach(() => {
            testComponent.includeOtherFixes = true;
            fixture.detectChanges();
        });

        it("should show the more fixes button", () => {
            expect(de.query(By.css(".other-fixes-btn"))).not.toBeNull();
            expect(de.query(By.css(".other-fixes"))).toBeNull();
        });

        it("should list other fixes when mouse over the more fixes button", () => {
            mouseenter(de.query(By.css(".other-fixes-btn")));
            fixture.detectChanges();
            const otherFixesEl = de.query(By.css(".other-fixes"));
            expect(otherFixesEl).not.toBeNull();
            const els = otherFixesEl.queryAll(By.css(".other-fix"));
            expect(els.length).toBe(2);
            expect(els[0].nativeElement.textContent).toContain("Second fix");
            expect(els[1].nativeElement.textContent).toContain("Third fix");
        });
    });

    describe("when switching id after clicking fix it", () => {
        let subject;
        beforeEach(() => {
            subject = new AsyncSubject();
            testComponent.fix1 = (() => subject) as any;
            fixture.detectChanges();
            component.triggerFix();
            fixture.detectChanges();
            expect(de.query(By.css(".quick-fix-btn-container .btn")).nativeElement.textContent).toContain("Fixing");
        });

        it("should not show the fixed message", fakeAsync(() => {
            testComponent.bannerId = "id-2";
            fixture.detectChanges();
            expect(de.query(By.css(".quick-fix-btn-container .btn")).nativeElement.textContent).toContain("Main fix");
            subject.next(true);
            subject.complete();
            expect(de.query(By.css(".quick-fix-btn-container .btn")).nativeElement.textContent)
                .toContain("Main fix", "Should still be Main fix after fix observable resolve");
        }));
    });
});
