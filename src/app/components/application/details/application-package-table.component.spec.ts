import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { Property, TelemetryService } from "@batch-flask/core";
import { DialogService } from "@batch-flask/ui";
import { ActivityService } from "@batch-flask/ui/activity";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { TableTestingModule } from "@batch-flask/ui/testing";
import { ApplicationPackageTableComponent } from "app/components/application/details";
import { BatchApplication, BatchApplicationPackage, PackageState } from "app/models";
import { BatchApplicationPackageService, BatchApplicationService } from "app/services";
import { Subject, of } from "rxjs";
import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";
import { NoItemMockComponent } from "test/utils/mocks/components";

const applications = {
    banana: Fixtures.application.create({ id: "/applications/banana", name: "banana" }),
    noPackages: Fixtures.application.create({ id: "/applications/noPackages", name: "noPackages" }),
};

const common = {
    format: "zip",
    lastActivationTime: new Date(),
    storageUrl: "https://foo.blob.storage.azure.com/bar",
    storageUrlExpiry: new Date(),
};

const packages = {
    [applications.banana.id]: [
        new BatchApplicationPackage({ id: "b1", name: "b1", properties: { state: PackageState.active, ...common } }),
        new BatchApplicationPackage({ id: "b2", name: "b2", properties: { state: PackageState.pending, ...common } }),
        new BatchApplicationPackage({ id: "b3", name: "b3", properties: { state: PackageState.active, ...common } }),
    ],
    [applications.noPackages.id]: [],
};
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
    let applicationPackageServiceSpy: any;

    beforeEach(() => {
        applicationServiceSpy = {
            getByName: jasmine.createSpy("getByName").and.callFake((appName: string) => {
                return of(applications[appName]);
            }),
        };

        applicationPackageServiceSpy = {
            listView: () => new MockListView(BatchApplicationPackage, {
                items: ({ applicationId }) => {
                    return packages[applicationId] || [];
                },
            }),
            onPackageAdded: new Subject(),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, TableTestingModule],
            declarations: [
                ApplicationPackageTableComponent, NoItemMockComponent, TestComponent,
            ],
            providers: [
                { provide: DialogService, useValue: null },
                { provide: BatchApplicationService, useValue: applicationServiceSpy },
                { provide: BatchApplicationPackageService, useValue: applicationPackageServiceSpy },
                { provide: ActivityService, useValue: null },
                { provide: ContextMenuService, useValue: null },
                { provide: SidebarManager, useValue: null },
                { provide: BreadcrumbService, useValue: null },
                { provide: TelemetryService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bl-application-package-table")).componentInstance;
        testComponent.application = applications.banana;
        fixture.detectChanges();
    });

    describe("when application has no packages", () => {
        beforeEach(() => {
            testComponent.application = applications.noPackages;
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
        beforeEach(() => {
            testComponent.application = applications.banana;
            fixture.detectChanges();
        });

        it("should not show no item error", () => {
            expect(fixture.debugElement.query(By.css(".no-item-message"))).toBe(null);
        });

        it("should have 5 packages", () => {
            expect(component.packages.size).toBe(3);
            expect(component.displayedPackages.size).toBe(3);
        });
    });

    describe("can filter application packages based on name", () => {
        beforeEach(() => {
            component.filter = Object.assign(new Property("name"), { value: "b2" });
            fixture.detectChanges();
        });

        it("shoud show only 1 package", () => {
            expect(component.displayedPackages.size).toBe(1);
            expect(component.packages.size).toBe(3);
        });

        it("show filter warning if nothing matches", () => {
            component.filter = Object.assign(new Property("version"), { value: "asdasd" });
            fixture.detectChanges();

            expect(component.displayedPackages.size).toBe(0);

            const container = fixture.debugElement.query(By.css("bl-no-item"));
            expect(container.nativeElement.textContent).toContain("Current filter returned no matches");
            expect(container).toBeVisible();
        });
    });
});
