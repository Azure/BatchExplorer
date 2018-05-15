import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable } from "rxjs";

import { Property } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { ApplicationPackageTableComponent } from "app/components/application/details";
import { BatchApplication } from "app/models";
import { ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import { NoItemMockComponent, TableTestingModule } from "test/utils/mocks/components";

import { ContextMenuService } from "@batch-flask/ui";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";

const appWithPackagesId: string = "app-2";
const appWithoutPackagesId: string = "app-1";
const disabledApp: string = "app-3";
const applicationMap: Map<string, BatchApplication> = new Map()
    .set(appWithoutPackagesId, Fixtures.application.create({ id: appWithoutPackagesId }))
    .set(appWithPackagesId, Fixtures.application.create({
        id: appWithPackagesId, packages: [
            Fixtures.applicationPackage.create({ version: "1.0" }),
            Fixtures.applicationPackage.create({ version: "2.0" }),
            Fixtures.applicationPackage.create({ version: "3.0" }),
            Fixtures.applicationPackage.create({ version: "4.0" }),
            Fixtures.applicationPackage.create({ version: "5.0" }),
        ],
    }))
    .set(disabledApp, Fixtures.application.create({
        id: disabledApp, allowUpdates: false, packages: [
            Fixtures.applicationPackage.create({ version: "1.0" }),
            Fixtures.applicationPackage.create({ version: "2.0" }),
        ],
    }));

@Component({
    template: `
        <bl-application-package-table [application]="application" [filter]="filter">
        </bl-application-package-table>
    `,
})
class TestComponent {
    public application: BatchApplication;
    public filter;
}

describe("ApplicationPackageTableComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ApplicationPackageTableComponent;
    let applicationServiceSpy: any;

    beforeEach(() => {
        applicationServiceSpy = {
            get: jasmine
                .createSpy("get").and
                .callFake((applicationId: string) => {

                    return Observable.of(
                        applicationMap.get(applicationId) || Fixtures.application.create({ id: applicationId }),
                    );
                }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, TableTestingModule],
            declarations: [
                ApplicationPackageTableComponent, NoItemMockComponent, TestComponent,
            ],
            providers: [
                { provide: MatDialog, useValue: null },
                { provide: ApplicationService, useValue: applicationServiceSpy },
                { provide: BackgroundTaskService, useValue: null },
                { provide: ContextMenuService, useValue: null },
                { provide: SidebarManager, useValue: null },
                { provide: BreadcrumbService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bl-application-package-table")).componentInstance;
        testComponent.application = applicationMap.get(appWithPackagesId);
        fixture.detectChanges();
    });

    describe("when application has no packages", () => {
        beforeEach(() => {
            testComponent.application = applicationMap.get(appWithoutPackagesId);
            fixture.detectChanges();
        });

        it("should show no item error", () => {
            const container = fixture.debugElement.query(By.css("bl-no-item"));
            expect(container.nativeElement.textContent).toContain("This application contains no package versions");
            expect(container).toBeVisible();
        });

        it("no dependencies should have been found", () => {
            expect(component.displayedPackages.size).toBe(0);
            expect(component.packages.size).toBe(0);
        });
    });

    describe("when application has packages", () => {
        it("should not show no item error", () => {
            expect(fixture.debugElement.query(By.css(".no-item-message"))).toBe(null);
        });

        it("shoud have 5 packages", () => {
            expect(component.displayedPackages.size).toBe(5);
            expect(component.packages.size).toBe(5);
        });
    });

    describe("can filter application packages based on ID", () => {
        beforeEach(() => {
            testComponent.filter = Object.assign(new Property("version"), { value: "1.0" });
            fixture.detectChanges();
        });

        it("shoud show only 1 package", () => {
            expect(component.displayedPackages.size).toBe(1);
            expect(component.packages.size).toBe(5);
        });

        it("show filter warning if nothing matches", () => {
            testComponent.filter = Object.assign(new Property("version"), { value: "asdasd" });
            fixture.detectChanges();

            expect(component.displayedPackages.size).toBe(0);

            const container = fixture.debugElement.query(By.css("bl-no-item"));
            expect(container.nativeElement.textContent).toContain("Current filter returned no matches");
            expect(container).toBeVisible();
        });
    });
});
