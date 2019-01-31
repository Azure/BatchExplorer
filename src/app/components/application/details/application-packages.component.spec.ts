import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MatDialog } from "@angular/material";
import { ListSelection } from "@batch-flask/core/list";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ActivityService } from "@batch-flask/ui/activity";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { ApplicationPackageTableComponent, ApplicationPackagesComponent } from "app/components/application/details";
import { BatchApplication, PackageState } from "app/models";
import { BatchApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import { EntityDetailsListMockComponent } from "test/utils/mocks/components";

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
    template: `<bl-application-packages [application]="application"></bl-application-packages>`,
})
class TestComponent {
    public application: BatchApplication;
}

describe("ApplicationPackagesComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ApplicationPackagesComponent;
    let listComponent: ApplicationPackageTableComponent;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            declarations: [TestComponent, ApplicationPackagesComponent,
                ApplicationPackageTableComponent, EntityDetailsListMockComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: MatDialog, useValue: null },
                { provide: BatchApplicationService, useValue: null },
                { provide: ActivityService, useValue: null },
                { provide: SidebarManager, useValue: null },
            ],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bl-application-packages")).componentInstance;
        testComponent.application = Fixtures.application.create({
            id: "app-1", packages: [
                Fixtures.applicationPackage.create({ version: "1.0" }),
                Fixtures.applicationPackage.create({ version: "2.0" }),
            ],
        });
        listComponent = fixture.debugElement.query(By.css("bl-application-package-table")).componentInstance;

        fixture.detectChanges();
    });

    it("should show no item error", () => {
        expect(component.application).toBeDefined();
        expect(component.application.id).toBe("app-1");
    });

    describe("table context commands are displayed", () => {
        it("delete button displayed", () => {
            const container = fixture.debugElement.query(By.css("bl-button[title=\"Delete selected\"]"));
            expect(container.nativeElement).toBeDefined();
        });

        it("edit button displayed", () => {
            const container = fixture.debugElement.query(By.css("bl-button[title=\"Update package\"]"));
            expect(container.nativeElement).toBeDefined();
        });

        it("activate button displayed", () => {
            const container = fixture.debugElement.query(By.css("bl-button[title=\"Activate pending package\"]"));
            expect(container.nativeElement).toBeDefined();
        });
    });

    describe("table action buttons show correct state", () => {
        it("add, edit, and activate disabled on load", () => {
            expect(component.deleteEnabled).toBe(false);
            expect(component.activateEnabled).toBe(false);
        });

        describe("deleteItemEnabled", () => {
            beforeEach(() => {
                listComponent.activeItem = "1.0";
                fixture.detectChanges();
            });

            it("enabled if one item selected", () => {
                listComponent.selection = new ListSelection({ keys: ["1.0"] });
                fixture.detectChanges();
                expect(component.deleteEnabled).toBe(true);
            });

            it("enabled if many items selected", () => {
                listComponent.selection = new ListSelection({ keys: ["1.0", "2.0", "3.0"] });
                expect(component.deleteEnabled).toBe(true);
            });

            it("disabled if application.allowUpdates set to false", () => {
                component.application = applicationMap.get(disabledApp);
                listComponent.activeItem = "2.0";
                fixture.detectChanges();

                expect(component.deleteEnabled).toBe(false);
            });
        });

        describe("activateItemEnabled", () => {
            beforeEach(() => {
                testComponent.application = Fixtures.application.create({
                    id: "app-4", packages: [
                        Fixtures.applicationPackage.create({ version: "active", state: PackageState.active }),
                        Fixtures.applicationPackage.create({ version: "pending1", state: PackageState.pending }),
                        Fixtures.applicationPackage.create({ version: "pending2", state: PackageState.pending }),
                    ],
                });

                fixture.detectChanges();
            });

            it("enabled if one pending item selected", () => {
                listComponent.activeItem = "pending1";
                fixture.detectChanges();
                expect(component.activateEnabled).toBe(true);
            });

            it("disabled if one active item selected", () => {
                listComponent.activeItem = "active";
                fixture.detectChanges();
                expect(component.activateEnabled).toBe(false);
            });

            it("disabled if many items selected", () => {
                listComponent.activeItem = "pending1";
                listComponent.selection = new ListSelection({ keys: ["pending1", "pending2"] });
                fixture.detectChanges();
                expect(component.activateEnabled).toBe(false);
            });
        });
    });
});
