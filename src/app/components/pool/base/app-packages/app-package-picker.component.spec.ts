import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, LoadingModule, PermissionService } from "@batch-flask/ui";
import { EditableTableComponent, EditableTableModule } from "@batch-flask/ui/form/editable-table";
import { EditableTableSelectCellComponent } from "@batch-flask/ui/form/editable-table/select-cell";
import { AppPackagePickerComponent } from "app/components/pool/base";
import { ApplicationPackageReferenceAttributes, BatchApplication } from "app/models";
import { BatchApplicationPackageService, BatchApplicationService } from "app/services";
import { AutoStorageService } from "app/services/storage";
import { List } from "immutable";
import { BehaviorSubject, of } from "rxjs";
import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";

@Component({
    template: `
        <bl-app-package-picker [formControl]="references" >
        </bl-app-package-picker>
    `,
})
class TestComponent {
    public references = new FormControl<ApplicationPackageReferenceAttributes[]>([]);
}

const applications = {
    apple: Fixtures.application.create({ id: "/applications/apple", name: "apple" }),
    banana: Fixtures.application.create({ id: "/applications/banana", name: "banana" }),
    orange: Fixtures.application.create({ id: "/applications/orange", name: "orange" }),
};

const packages = {
    [applications.apple.id]: List([{ name: "a1" }]),
    [applications.banana.id]: List([{ name: "b1" }, { name: "b2" }]),
    [applications.orange.id]: List([{ name: "o1" }, { name: "o2" }]),
};

describe("AppPackagePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: AppPackagePickerComponent;
    let de: DebugElement;

    let listProxy: MockListView<BatchApplication, any>;
    let applicationServiceSpy;
    let applicationPackageServiceSpy;
    let autoStorageServiceSpy;
    let editableTableEl: DebugElement;
    let editableTable: EditableTableComponent;

    beforeEach(() => {
        listProxy = new MockListView(BatchApplication, {
            cacheKey: "id",
            items: [
                applications.apple,
                applications.banana,
                applications.orange,
            ],
        });

        applicationServiceSpy = {
            listView: () => listProxy,
            getByName: jasmine.createSpy("getByName").and.callFake((appName: string) => {
                return of(applications[appName]);
            }),
        };

        applicationPackageServiceSpy = {
            listAll: jasmine.createSpy("listAll").and.callFake((appId: string) => {
                return of(packages[appId] || List([]));
            }),
        };

        autoStorageServiceSpy = {
            hasAutoStorage: new BehaviorSubject(true),
        };

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MaterialModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                EditableTableModule,
                I18nTestingModule,
                LoadingModule,
                FormModule,
            ],
            declarations: [AppPackagePickerComponent, TestComponent],
            providers: [
                { provide: BatchApplicationService, useValue: applicationServiceSpy },
                { provide: BatchApplicationPackageService, useValue: applicationPackageServiceSpy },
                { provide: AutoStorageService, useValue: autoStorageServiceSpy },
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: PermissionService, useValue: {} },
            ],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-app-package-picker"));
        component = de.componentInstance;
        fixture.detectChanges();

        editableTableEl = fixture.debugElement.query(By.css("bl-editable-table"));
        editableTable = editableTableEl.componentInstance;
    });

    function getCells(rowIndex: number): EditableTableSelectCellComponent[] {
        const rows = editableTableEl.queryAll(By.css("tbody tr"));
        const cellEls = rows[rowIndex].queryAll(By.css("bl-editable-table-select-cell"));
        return cellEls.map(x => x.componentInstance);
    }

    it("should have the correct column labels", () => {
        const columns = de.queryAll(By.css("thead th"));

        expect(columns.length).toBe(3); // include delete button column
        expect(columns[0].nativeElement.textContent).toContain("Application");
        expect(columns[1].nativeElement.textContent).toContain("Version");
    });

    it("should have loaded the applications", () => {
        expect(component.applicationNames.length).toEqual(3);
        expect(component.applicationNames).toEqual([
            "apple",
            "banana",
            "orange",
        ]);

        const cells = getCells(0);
        expect(cells[0].actualOptions).toEqual(["apple", "banana", "orange"]);
    });

    it("picking application load versions and update select", () => {
        editableTable.items.at(0).patchValue({ applicationId: "banana" });
        fixture.detectChanges();

        expect(applicationServiceSpy.getByName).toHaveBeenCalledOnce();
        expect(applicationServiceSpy.getByName).toHaveBeenCalledWith("banana");

        expect(applicationPackageServiceSpy.listAll).toHaveBeenCalledOnce();
        expect(applicationPackageServiceSpy.listAll).toHaveBeenCalledWith("/applications/banana");
        fixture.detectChanges();

        const cells = getCells(0);
        expect(cells[1].actualOptions).toEqual(["b1", "b2"]);
    });

    it("propagates the changes", () => {
        editableTable.writeValue([
            { applicationId: "orange", version: "o1" },
            { applicationId: "banana", version: "b1" },
        ]);
        fixture.detectChanges();

        expect(testComponent.references.value).toEqual([
            { applicationId: "orange", version: "o1" },
            { applicationId: "banana", version: "b1" },
        ]);
    });
    describe("validation", () => {
        it("validates ok with correct values", () => {
            editableTable.writeValue([
                { applicationId: "orange", version: "o1" },
                { applicationId: "banana", version: "b1" },
            ]);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).not.toContain("specified twice");
        });

        it("validation fails with duplicates", () => {
            editableTable.writeValue([
                { applicationId: "orange", version: "o1" },
                { applicationId: "banana", version: "b1" },
                { applicationId: "orange", version: "o1" },
            ]);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).toContain("Application orange has version o1 specified twice");
        });
    });
});
