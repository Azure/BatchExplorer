import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { MaterialModule, MdCheckboxChange, MdDialog } from "@angular/material";
import { By } from "@angular/platform-browser";

import { AppLicensePickerComponent } from "app/components/pool/action/add";

@Component({
    template: `<bl-app-license-picker [(ngModel)]="appLicenses"></bl-app-license-picker>`,
})
class TestComponent {
    public appLicenses: string[] = [];
}

describe("AppLicensePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: AppLicensePickerComponent;
    let debugElement: DebugElement;
    let mdDialogSpy: any;

    beforeEach(() => {
        mdDialogSpy = {
            open: jasmine.createSpy("open").and.callFake((...args) => {
                return {
                    componentInstance: { licenseName: "" },
                };
            }),
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, MaterialModule],
            declarations: [AppLicensePickerComponent, TestComponent],
            providers: [
                { provide: MdDialog, useValue: mdDialogSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css("bl-app-license-picker"));
        component = debugElement.componentInstance;
        fixture.detectChanges();
    });

    it("Should show 2 licenses for now", () => {
        const tableRows = debugElement.queryAll(By.css("bl-row"));
        expect(tableRows.length).toBe(2);

        const row1Columns = tableRows[0].queryAll(By.css("bl-cell"));
        expect(row1Columns.length).toBe(4, "Row has 4 columns");
        // first column has a checkbox
        expect(row1Columns[1].nativeElement.textContent).toContain("Autodesk Maya");
        expect(row1Columns[2].nativeElement.textContent).toContain("EULA");
        expect(row1Columns[3].nativeElement.textContent).toContain("50c USD/core/hour*");

        const row2Columns = tableRows[1].queryAll(By.css("bl-cell"));
        expect(row2Columns.length).toBe(4, "Row has 4 columns");
        // first column has a checkbox
        expect(row2Columns[1].nativeElement.textContent).toContain("Autodesk Arnold");
        expect(row2Columns[2].nativeElement.textContent).toContain("EULA");
        expect(row2Columns[3].nativeElement.textContent).toContain("2c USD/core/hour*");
    });

    it("Should select license by checking checkbox", fakeAsync(() => {
        component.pickLicense("maya", { checked: true } as MdCheckboxChange);
        tick();
        fixture.detectChanges();
        expect(testComponent.appLicenses.length).toEqual(1);
        expect(testComponent.appLicenses[0]).toEqual("maya");
    }));

    it("Uncheck should not add the license", fakeAsync(() => {
        component.pickLicense("maya", { checked: true } as MdCheckboxChange);
        tick();
        component.pickLicense("maya", { checked: false } as MdCheckboxChange);
        tick();
        fixture.detectChanges();
        expect(testComponent.appLicenses.length).toEqual(0);
    }));

    describe("EULA", () => {
        it("Calling viewEula opens dialog", () => {
            component.viewEula("license name");
            expect(mdDialogSpy.open).toHaveBeenCalledTimes(1);
        });
    });

    describe("Validation", () => {
        it("Validation passes if nothing selected", fakeAsync(() => {
            expect(component.validate(null)).toBeNull();
        }));

        it("Validation fails if license selected and checkbox not checked", fakeAsync(() => {
            component.pickLicense("maya", { checked: true } as MdCheckboxChange);
            tick();
            fixture.detectChanges();
            expect(component.validate(null)).toEqual({ required: true });
        }));

        it("Validation passes if license selected and checkbox checked", fakeAsync(() => {
            component.pickLicense("maya", { checked: true } as MdCheckboxChange);
            tick();
            component.eulaCheck({ checked: true } as MdCheckboxChange);
            tick();
            fixture.detectChanges();
            expect(component.validate(null)).toBeNull();
        }));
    });
});
