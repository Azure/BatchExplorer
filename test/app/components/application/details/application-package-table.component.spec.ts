import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable } from "rxjs";

import { ApplicationPackageTableComponent } from "app/components/application/details";
import { BackgroundTaskService } from "app/components/base/background-task";
import { SidebarManager } from "app/components/base/sidebar";
import { BatchApplication, PackageState } from "app/models";
import { ApplicationService } from "app/services";
import { Property } from "app/utils/filter-builder";
import * as Fixtures from "test/fixture";
import { NoItemMockComponent } from "test/utils/mocks/components";

import {
    TableCellComponent, TableColumnComponent, TableComponent, TableHeadComponent,
} from "app/components/base/table";

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
            imports: [RouterTestingModule],
            declarations: [
                ApplicationPackageTableComponent, NoItemMockComponent, TableComponent, TableCellComponent,
                TableColumnComponent, TableHeadComponent, TestComponent,
            ],
            providers: [
                { provide: MatDialog, useValue: null },
                { provide: ApplicationService, useValue: applicationServiceSpy },
                { provide: BackgroundTaskService, useValue: null },
                { provide: SidebarManager, useValue: null },
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

    describe("table action buttons show correct state", () => {
        it("add, edit, and activate disabled on load", () => {
            expect(component.deleteItemEnabled.value).toBe(false);
            expect(component.activateItemEnabled.value).toBe(false);
            expect(component.editItemEnabled.value).toBe(false);
        });

        describe("deleteItemEnabled", () => {
            beforeEach(() => {
                component.table.setActiveItem("1.0");
            });

            it("enabled if one item selected", () => {
                component.table.selectedItems = ["1.0"];
                expect(component.deleteItemEnabled.value).toBe(true);
            });

            it("enabled if many items selected", () => {
                component.table.selectedItems = ["1.0", "2.0", "3.0"];
                expect(component.deleteItemEnabled.value).toBe(true);
            });

            it("disabled if application.allowUpdates set to false", () => {
                component.application = applicationMap.get(disabledApp);
                component.table.setActiveItem("2.0");
                fixture.detectChanges();

                expect(component.deleteItemEnabled.value).toBe(false);
            });
        });

        describe("editItemEnabled", () => {
            beforeEach(() => {
                component.table.setActiveItem("1.0");
            });

            it("enabled if one item selected", () => {
                component.table.selectedItems = ["1.0"];
                expect(component.editItemEnabled.value).toBe(true);
            });

            it("disabled if many items selected", () => {
                component.table.selectedItems = ["1.0", "2.0", "3.0"];
                expect(component.editItemEnabled.value).toBe(false);
            });

            it("disabled if application.allowUpdates set to false", () => {
                component.application = applicationMap.get(disabledApp);
                component.table.setActiveItem("2.0");
                fixture.detectChanges();

                expect(component.editItemEnabled.value).toBe(false);
            });
        });

        describe("activateItemEnabled", () => {
            beforeEach(() => {
                component.application = Fixtures.application.create({
                    id: "app-4", packages: [
                        Fixtures.applicationPackage.create({ version: "active", state: PackageState.active }),
                        Fixtures.applicationPackage.create({ version: "pending1", state: PackageState.pending }),
                        Fixtures.applicationPackage.create({ version: "pending2", state: PackageState.pending }),
                    ],
                });

                component.ngOnChanges({ application: component.application });
                fixture.detectChanges();
            });

            it("enabled if one pending item selected", () => {
                component.table.setActiveItem("pending1");
                expect(component.activateItemEnabled.value).toBe(true);
            });

            it("disabled if one active item selected", () => {
                component.table.setActiveItem("active");
                expect(component.activateItemEnabled.value).toBe(false);
            });

            it("disabled if many items selected", () => {
                component.table.setActiveItem("pending1");
                component.table.selectedItems = ["pending1", "pending2"];
                expect(component.activateItemEnabled.value).toBe(false);
            });
        });
    });
});
