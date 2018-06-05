import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BehaviorSubject } from "rxjs";

import { ENTER } from "@batch-flask/core/keys";
import { BreadcrumbGroupComponent, BreadcrumbModule, BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { click, keydown } from "test/utils/helpers";
import { pool1Crumb, pool1PropertiesCrumb, poolsCrumb } from "../crumbs-data.spec";

describe("BreadcrumbGroupComponent", () => {
    let fixture: ComponentFixture<BreadcrumbGroupComponent>;
    let serviceSpy;

    function getBreadcrumbs() {
        return fixture.debugElement.queryAll(By.css("bl-breadcrumb"));
    }
    beforeEach(() => {
        serviceSpy = {
            crumbs: new BehaviorSubject([poolsCrumb, pool1Crumb, pool1PropertiesCrumb]),
            navigateTo: jasmine.createSpy("navigateTo"),
        };
        TestBed.configureTestingModule({
            imports: [BreadcrumbModule],
            providers: [{ provide: BreadcrumbService, useValue: serviceSpy }],
        });
        fixture = TestBed.createComponent(BreadcrumbGroupComponent);
        fixture.detectChanges();
    });

    it("should display all the crumbs", () => {
        const crumbs = getBreadcrumbs();
        expect(crumbs.length).toBe(3);
        expect(crumbs[0].nativeElement.textContent).toContain(poolsCrumb.data.name);
        expect(crumbs[1].nativeElement.textContent).toContain(pool1Crumb.data.name);
        expect(crumbs[2].nativeElement.textContent).toContain(pool1PropertiesCrumb.data.name);
    });

    it("should navigate to breadcrumb when clicking", () => {
        const crumbs = getBreadcrumbs();
        const crumbEl = crumbs[1];
        click(crumbEl);
        const crumb = crumbEl.componentInstance.crumb;
        fixture.detectChanges();
        expect(serviceSpy.navigateTo).toHaveBeenCalledOnce();
        expect(serviceSpy.navigateTo).toHaveBeenCalledWith(crumb);
    });

    it("should navigate to breadcrumb when pressing ENTER", () => {
        const crumbs = getBreadcrumbs();
        const crumbEl = crumbs[1];
        keydown(crumbEl.nativeElement, ENTER);
        const crumb = crumbEl.componentInstance.crumb;
        fixture.detectChanges();
        expect(serviceSpy.navigateTo).toHaveBeenCalledOnce();
        expect(serviceSpy.navigateTo).toHaveBeenCalledWith(crumb);
    });
});
