import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MatTooltip, MatTooltipModule } from "@angular/material";
import { NavigatorService } from "app/services";
import { OnlineStatusComponent } from "./online-status.component";

@Component({
    template: `<bl-online-status></bl-online-status>`,
})
class TestComponent {
}

describe("OnlineStatusComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: OnlineStatusComponent;
    let de: DebugElement;
    let navigatorServiceSpy;
    let browserOnline = null;

    class NavigatorServiceSpy {
        public get onLine() {
            return browserOnline;
        }
    }

    beforeEach(() => {
        navigatorServiceSpy = new NavigatorServiceSpy();

        TestBed.configureTestingModule({
            imports: [MatTooltipModule],
            declarations: [OnlineStatusComponent, TestComponent],
            providers: [
                { provide: NavigatorService, useValue: navigatorServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-online-status"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    describe("when  browser online", () => {
        beforeEach(async () => {
            browserOnline = true;
            fixture.detectChanges();
            await component.updateOnlineStatus();
            fixture.detectChanges();
        });

        it("is not marked as offline", async () => {
            expect(component.offline).toBe(false);
        });

        it("doesn't show offline text", async () => {
            expect(de.nativeElement.textContent).not.toContain("Not connected");
        });
    });

    describe("when browser offline", () => {
        beforeEach(async () => {
            browserOnline = false;
            fixture.detectChanges();
            await component.updateOnlineStatus();
            fixture.detectChanges();
        });

        it("is marked as offline", async () => {

            expect(component.offline).toBe(true);
        });

        it("doesn't show offline text", async () => {
            expect(de.nativeElement.textContent).toContain("Not connected");
        });

        it("show offline tooltip", async () => {
            const tooltipEl = de.query(By.directive(MatTooltip));
            expect(tooltipEl).not.toBeFalsy();
            const tooltip = tooltipEl.injector.get(MatTooltip);
            expect(tooltip.message).toBe("Seems like the internet connection is broken.");
        });
    });
});
