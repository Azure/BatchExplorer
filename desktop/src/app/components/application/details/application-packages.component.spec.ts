import { Component, Injector, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { By } from "@angular/platform-browser";
import { ListSelection } from "@batch-flask/core/list";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ListBaseComponent } from "@batch-flask/ui";
import { ApplicationPackageTableComponent, ApplicationPackagesComponent } from "app/components/application/details";
import { BatchApplication, BatchApplicationPackage, PackageState } from "app/models";
import { of } from "rxjs";
import * as Fixtures from "test/fixture";
import { EntityDetailsListMockComponent } from "test/utils/mocks/components";
import { BatchApplicationPackageCommands } from "../action";

const disabledApp = new BatchApplication({
    id: "locked-app",
    name: "locked-app",
    properties: {
        allowUpdates: false,
        defaultVersion: "1.0",
        displayName: "Foo bar",
    },
});

@Component({
    template: `<bl-application-packages [application]="application"></bl-application-packages>`,
})
class TestComponent {
    public application: BatchApplication = Fixtures.application.create({
        id: "app-1",
        name: "app-1",
        properties: {
            allowUpdates: true,
        },
    });
}

@Component({
    selector: "bl-application-package-table",
    template: "",
})
class MockApplicationPackageTableComponent extends ListBaseComponent {
    public handleFilter = jasmine.createSpy("handleFilter").and.returnValue(of(null));

    constructor(injector: Injector) {
        super(injector);
    }
}

const pkg1 = new BatchApplicationPackage({
    id: "1.0",
    name: "1.0",
    properties: {
        state: PackageState.pending,
    } as any,
});

describe("ApplicationPackagesComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: ApplicationPackagesComponent;
    let listComponent: ApplicationPackageTableComponent;
    let commandsSpy;

    beforeEach(() => {

        commandsSpy = {
            getFromCache: () => of(pkg1),
            activate: {
                enabled: () => true,
            },
        };
        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            declarations: [
                TestComponent,
                ApplicationPackagesComponent,
                EntityDetailsListMockComponent,
                MockApplicationPackageTableComponent,
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: MatDialog, useValue: null },
            ],
        });
        TestBed.overrideComponent(
            ApplicationPackagesComponent,
            {
                set: {
                    providers: [{ provide: BatchApplicationPackageCommands, useValue: commandsSpy }],
                },
            },
        );

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.debugElement.query(By.css("bl-application-packages")).componentInstance;
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
                listComponent.selection = new ListSelection({ keys: ["1.0"] });
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
                component.application = disabledApp;
                listComponent.selection = new ListSelection({ keys: ["2.0"] });
                fixture.detectChanges();

                expect(component.deleteEnabled).toBe(false);
            });
        });

        describe("activateItemEnabled", () => {
            it("enabled if one pending item selected", () => {
                listComponent.selection = new ListSelection({ keys: ["1.0"] });
                fixture.detectChanges();
                expect(component.activateEnabled).toBe(true);
            });

            it("disabled if many items selected", () => {
                listComponent.selection = new ListSelection({ keys: ["1.0", "2.0"] });
                fixture.detectChanges();
                expect(component.activateEnabled).toBe(false);
            });
        });
    });
});
