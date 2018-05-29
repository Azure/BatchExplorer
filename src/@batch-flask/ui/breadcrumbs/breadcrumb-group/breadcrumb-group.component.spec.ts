import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BehaviorSubject } from "rxjs";

import { BreadcrumbGroupComponent, BreadcrumbModule, BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { pool1Crumb, pool1PropertiesCrumb, poolsCrumb } from "../crumbs-data.spec";

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
});
