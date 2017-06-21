import { Component } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { TabsModule } from "app/components/base/tabs";

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
    let component: TabTestComponent;
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
            imports: [MaterialModule, TabsModule, NoopAnimationsModule],
            declarations: [TabTestComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activeRouteSpy },
            ],
        });

        fixture = TestBed.createComponent(TabTestComponent);
        component = fixture.componentInstance;
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

    it("changing the route should update the tab", () => {
        activeRouteSpy.queryParams.next({ tab: "second" });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain("Content 2");
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it("clicking on a tab label should update the route", async(() => {
        const labels = fixture.debugElement.queryAll(By.css(".mat-tab-label"));
        expect(labels.length).toBe(2);
        labels[1].nativeElement.click();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain("Content 2");
        fixture.whenStable().then(() => {
            expect(routerSpy.navigate).toHaveBeenCalledOnce();
            expect(routerSpy.navigate).toHaveBeenCalledWith([], {
                relativeTo: activeRouteSpy,
                queryParams: {
                    tab: "second",
                },
            });
        });
    }));
});
