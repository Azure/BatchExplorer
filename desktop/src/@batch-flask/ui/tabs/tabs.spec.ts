import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTabsModule } from "@angular/material/tabs";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router } from "@angular/router";
import { TabsModule } from "@batch-flask/ui/tabs";
import { BehaviorSubject } from "rxjs";

@Component({
    template: `
        <bl-tab-group>
            <bl-tab key="first">
                <bl-tab-label>First label</bl-tab-label>
                Content 1
            </bl-tab>
            <bl-tab key="second">
                <bl-tab-label>Second label</bl-tab-label>
                Content 2
            </bl-tab>
        </bl-tab-group>
    `,
})
export class TabTestComponent {

}

describe("Tabs", () => {
    let fixture: ComponentFixture<TabTestComponent>;
    let routerSpy: any;
    let activeRouteSpy: any;

    beforeEach(() => {
        routerSpy = {
            navigate: jasmine.createSpy("navigate"),
        };
        activeRouteSpy = {
            queryParams: new BehaviorSubject<any>({}),
        };

        TestBed.configureTestingModule({
            imports: [MatTabsModule, TabsModule, NoopAnimationsModule],
            declarations: [TabTestComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activeRouteSpy },
            ],
        });

        fixture = TestBed.createComponent(TabTestComponent);
        fixture.detectChanges();
    });

    it("should show all labels", () => {
        expect(fixture.nativeElement.textContent).toContain("First label");
        expect(fixture.nativeElement.textContent).toContain("Second label");
    });

    it("should only show content 1 by default", () => {
        expect(fixture.nativeElement.textContent).toContain("Content 1");
        expect(fixture.nativeElement.textContent).not.toContain("Content 2");
    });

    it("changing the route should update the tab", async () => {
        activeRouteSpy.queryParams.next({ tab: "second" });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain("Content 2");
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it("clicking on a tab label should update the route", async () => {
        const labels = fixture.debugElement.queryAll(By.css(".mat-tab-label"));
        expect(labels.length).toBe(2);
        labels[1].nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain("Content 2");
        expect(routerSpy.navigate).toHaveBeenCalledOnce();
        expect(routerSpy.navigate).toHaveBeenCalledWith([], {
            relativeTo: activeRouteSpy,
            queryParams: {
                tab: "second",
            },
        });
    });
});
