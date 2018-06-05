import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MatTooltip, MatTooltipModule } from "@angular/material";
import { ElectronRemote } from "@batch-flask/ui";
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
    let remoteSpy;
    let browserOnline = null;
    let nodeOnline = null;

    class NavigatorServiceSpy {
        public get onLine() {
            return browserOnline;
        }
    }

    beforeEach(() => {
        navigatorServiceSpy = new NavigatorServiceSpy();

        remoteSpy = {
            send: jasmine.createSpy("electronRemote.send").and.callFake(() => {
                return nodeOnline ? Promise.resolve(true) : Promise.reject(false);
            }),
        };

        TestBed.configureTestingModule({
            imports: [MatTooltipModule],
            declarations: [OnlineStatusComponent, TestComponent],
            providers: [
                { provide: ElectronRemote, useValue: remoteSpy },
                { provide: NavigatorService, useValue: navigatorServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-online-status"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    describe("when both node and browser online", () => {
        beforeEach(async () => {
            nodeOnline = true;
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

    describe("when both node and browser offline", () => {
        beforeEach(async () => {
            nodeOnline = false;
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

    describe("when browser is online but node isn't", () => {
        beforeEach(async () => {
            nodeOnline = false;
            browserOnline = true;
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

        it("show offline tooltip with proxy might be a problem", async () => {
            const tooltipEl = de.query(By.directive(MatTooltip));
            expect(tooltipEl).not.toBeFalsy();
            const tooltip = tooltipEl.injector.get(MatTooltip);
            expect(tooltip.message).toBe("Seems like the internet connection is broken."
                + " This might be an issue with your proxy settings");
        });
    });

});
