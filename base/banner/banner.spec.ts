import { Component, DebugElement, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";

import { BannerComponent } from "app/components/base/banner";

@Component({
    template: `
        <bex-banner #banner>
            <div code>Error 404</div>
            <div message>Page not found</div>
            <div details *ngIf="includeDetails">You got to look carefully where you go</div>
        </bex-banner>
    `,
})
export class BannerTestComponent {
    @ViewChild("banner")
    public banner: BannerComponent;

    public includeDetails = true;
}

describe("Banner", () => {
    let fixture: ComponentFixture<BannerTestComponent>;
    let bannerElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule.forRoot()],
            declarations: [
                BannerComponent,
                BannerTestComponent,
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(BannerTestComponent);
        fixture.detectChanges();
        bannerElement = fixture.debugElement.query(By.css("bex-banner"));
    });

    describe("When there is details", () => {
        it("should not show details by default(Until you click)", () => {
            expect(fixture.componentRef.instance.banner.showDetails).toBe(false);
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

});
