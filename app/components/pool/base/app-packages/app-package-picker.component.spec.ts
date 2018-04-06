import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule, ServerError } from "@batch-flask/core";
import { List } from "immutable";

import { AppPackagePickerComponent } from "app/components/pool/base";
import { BatchApplication } from "app/models";
import { ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";

@Component({
    template: `
        <bl-app-package-picker [(ngModel)]="appPackages" (hasLinkedStorage)="handleHasLinkedStorage($event)">
        </bl-app-package-picker>
    `,
})
class TestComponent {
    public appPackages: string[] = [];
    public hasLinkedStorage: boolean = true;

    public handleHasLinkedStorage(hasLinkedStorage) {
        this.hasLinkedStorage = hasLinkedStorage;
    }
}

describe("AppPackagePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: AppPackagePickerComponent;
    let debugElement: DebugElement;

    let listProxy: MockListView<BatchApplication, any>;
    let applicationServiceSpy;

    beforeEach(() => {
        listProxy = new MockListView(BatchApplication, {
            cacheKey: "id",
            items: [
                Fixtures.application.create({ id: "apple", packages: List([{ version: "a1" }]) }),
                Fixtures.application.create({ id: "banana", packages: List([{ version: "b1" }, { version: "b2" }]) }),
                Fixtures.application.create({ id: "orange", packages: List([{ version: "o1" }, { version: "o2" }]) }),
            ],
        });

        applicationServiceSpy = {
            listView: () => listProxy,
            isAutoStorageError: (error: ServerError) => {
                return error && (error.code === "AccountNotEnabledForAutoStorage");
            },
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
            declarations: [AppPackagePickerComponent, TestComponent],
            providers: [
                { provide: ApplicationService, useValue: applicationServiceSpy },
                { provide: FormBuilder, useValue: new FormBuilder() },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css("bl-app-package-picker"));
        component = debugElement.componentInstance;
        fixture.detectChanges();
    });

    it("has linked storage", () => {
        expect(testComponent.hasLinkedStorage).toBe(true);
    });

    it("should have the correct column labels", () => {
        const columns = debugElement.queryAll(By.css("thead th"));

        expect(columns.length).toBe(3); // include delete button column
        expect(columns[0].nativeElement.textContent).toContain("Application");
        expect(columns[1].nativeElement.textContent).toContain("Package Version");
    });

    describe("check setup", () => {
        let applicationMap: any;

        beforeEach(() => {
            applicationMap = (component as any)._applicationMap;
        });

        it("should have 3 applications", () => {
            expect(component.applications.size).toEqual(3);
        });

        it("package map should be populated", () => {
            expect(Object.keys(applicationMap).length).toEqual(3);

            expect("apple" in applicationMap).toBeTruthy();
            expect(applicationMap["apple"].length).toEqual(1);

            expect("banana" in applicationMap).toBeTruthy();
            expect(applicationMap["banana"].length).toEqual(2);

            expect("orange" in applicationMap).toBeTruthy();
            expect(applicationMap["orange"].length).toEqual(2);

            expect("bob" in applicationMap).toBeFalsy();
        });

        it("picking application sets package version map", () => {
            component.applicationSelected({ value: "banana", source: null }, 0);
            expect(component.packageMap.length).toEqual(1);
            expect(component.packageMap[0].size).toEqual(2);

            const versions = component.packageMap[0].toArray();
            expect(versions[0]).toEqual("b1");
            expect(versions[1]).toEqual("b2");
        });
    });

    describe("check dom items", () => {
        let applcationInput: DebugElement;
        let versionInput: DebugElement;

        beforeEach(() => {
            component.addNewItem();
            fixture.detectChanges();

            applcationInput = debugElement.query(By.css("mat-select[formControlName=applicationId]"));
            versionInput = debugElement.query(By.css("mat-select[formControlName=version]"));
        });

        it("application and version inputs are visible", () => {
            expect(applcationInput).not.toBeFalsy();
            expect(versionInput).not.toBeFalsy();
        });

        it("Should have the right default values", () => {
            expect(applcationInput.nativeElement.value).toBeFalsy();
            expect(versionInput.nativeElement.value).toBeFalsy();
        });
    });

    describe("validation", () => {
        it("validates ok with correct values", () => {
            const values = {
                value: [
                    { applicationId: "orange", version: "o1" },
                    { applicationId: "banana", version: "b1" },
                ],
            } as any;

            const result = component.validate(values);
            expect(result).toBeNull();
        });

        it("validation fails with duplicates", () => {
            const values = {
                value: [
                    { applicationId: "orange", version: "o1" },
                    { applicationId: "banana", version: "b1" },
                    { applicationId: "orange", version: "o1" },
                ],
            } as any;

            const result = component.validate(values) as any;
            expect(result.duplicate).toBe(true);
        });

        it("validation fails with invalid selection", () => {
            const values = {
                value: [
                    { applicationId: "orange", version: "o1" },
                    { applicationId: "banana", version: "invalid" },
                ],
            } as any;

            const result = component.validate(values) as any;
            expect(result.invalid).toBe(true);
        });
    });
});
