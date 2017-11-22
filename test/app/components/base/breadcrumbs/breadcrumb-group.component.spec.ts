import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BehaviorSubject } from "rxjs";

import { BreadcrumbGroupComponent, BreadcrumbModule, BreadcrumbService } from "app/components/base/breadcrumbs";
import { click } from "test/utils/helpers";
import { jobsCrumb, node1Crumb, pool1Crumb, pool1PropertiesCrumb, poolsCrumb } from "./crumbs-data";

describe("BreadcrumbGroupComponent", () => {
    let fixture: ComponentFixture<BreadcrumbGroupComponent>;
    let serviceSpy;

    beforeEach(() => {
        serviceSpy = {
            crumbs: new BehaviorSubject([]),
        };
        TestBed.configureTestingModule({
            imports: [BreadcrumbModule],
            providers: [{ provide: BreadcrumbService, useValue: serviceSpy }],
        });
        fixture = TestBed.createComponent(BreadcrumbGroupComponent);
        fixture.detectChanges();
    });

    describe("when there is less than 4 crumbs", () => {
        beforeEach(() => {
            serviceSpy.crumbs.next([poolsCrumb, pool1Crumb, pool1PropertiesCrumb]);
            fixture.detectChanges();
        });

        it("should display all the crumbs", () => {
            const crumbs = fixture.debugElement.queryAll(By.css("bl-breadcrumb"));
            expect(crumbs.length).toBe(3);
            expect(crumbs[0].nativeElement.textContent).toContain(poolsCrumb.data.name);
            expect(crumbs[1].nativeElement.textContent).toContain(pool1Crumb.data.name);
            expect(crumbs[2].nativeElement.textContent).toContain(pool1PropertiesCrumb.data.name);
        });
    });

    describe("when there is more than 4 crumbs", () => {
        beforeEach(() => {
            serviceSpy.crumbs.next([poolsCrumb, pool1Crumb, pool1PropertiesCrumb, node1Crumb, jobsCrumb]);
            fixture.detectChanges();
        });

        it("should only display 4 crumbs", () => {
            const crumbs = fixture.debugElement.queryAll(By.css("bl-breadcrumb"));
            expect(crumbs.length).toBe(4);
            expect(crumbs[0].nativeElement.textContent).toContain(poolsCrumb.data.name);
            expect(crumbs[1].nativeElement.textContent).toContain(pool1PropertiesCrumb.data.name);
            expect(crumbs[2].nativeElement.textContent).toContain(node1Crumb.data.name);
            expect(crumbs[3].nativeElement.textContent).toContain(jobsCrumb.data.name);
        });

        it("should display the expand button", () => {
            const expandBtn = fixture.debugElement.query(By.css(".expand"));
            expect(expandBtn).toBeTruthy();
        });

        it("clicking on expand btn should show all crumbs", () => {
            const expandBtn = fixture.debugElement.query(By.css(".expand"));
            click(expandBtn);
            fixture.detectChanges();
            const crumbs = fixture.debugElement.queryAll(By.css("bl-breadcrumb"));
            expect(crumbs.length).toBe(5);

            expect(crumbs[0].nativeElement.textContent).toContain(poolsCrumb.data.name);
            expect(crumbs[1].nativeElement.textContent).toContain(pool1Crumb.data.name);
            expect(crumbs[2].nativeElement.textContent).toContain(pool1PropertiesCrumb.data.name);
            expect(crumbs[3].nativeElement.textContent).toContain(node1Crumb.data.name);
            expect(crumbs[4].nativeElement.textContent).toContain(jobsCrumb.data.name);
        });
    });
});
