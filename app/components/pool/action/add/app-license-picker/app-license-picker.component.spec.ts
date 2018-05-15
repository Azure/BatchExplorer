import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { MatCheckboxChange, MatDialog } from "@angular/material";
import { By } from "@angular/platform-browser";

import { MaterialModule } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
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
    let matDialogSpy: any;

    beforeEach(() => {
        matDialogSpy = {
            open: jasmine.createSpy("open").and.callFake((...args) => {
                return {
                    componentInstance: { license: null },
                };
            }),
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, MaterialModule],
            declarations: [AppLicensePickerComponent, TestComponent],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css("bl-app-license-picker"));
        component = debugElement.componentInstance;
        fixture.detectChanges();
    });

    it("Should show 3 licenses for now", () => {
        const tableRows = debugElement.queryAll(By.css("bl-row-render"));
        expect(tableRows.length).toBe(4);

        const row1Columns = tableRows[0].queryAll(By.css(".bl-table-cell"));
        expect(row1Columns.length).toBe(3, "Row has 3 columns");
        expect(row1Columns[0].nativeElement.textContent).toContain("Autodesk Maya");
        expect(row1Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row1Columns[2].nativeElement.textContent).toContain("62.5c USD/node/hour");

        const row2Columns = tableRows[1].queryAll(By.css(".bl-table-cell"));
        expect(row2Columns[0].nativeElement.textContent).toContain("Autodesk 3ds Max");
        expect(row2Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row2Columns[2].nativeElement.textContent).toContain("62.5c USD/node/hour");

        const row3Columns = tableRows[2].queryAll(By.css(".bl-table-cell"));
        expect(row3Columns[0].nativeElement.textContent).toContain("Autodesk Arnold");
        expect(row3Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row3Columns[2].nativeElement.textContent).toContain("2.5c USD/core/hour");

        const row4Columns = tableRows[3].queryAll(By.css(".bl-table-cell"));
        expect(row4Columns[0].nativeElement.textContent).toContain("Chaos Group V-Ray");
        expect(row4Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row4Columns[2].nativeElement.textContent).toContain("TBD");
    });

    it("Should select license by checking checkbox", fakeAsync(() => {
        component.updateSelection(new ListSelection({ keys: ["maya"] }));
        tick();
        fixture.detectChanges();
        expect(testComponent.appLicenses.length).toEqual(1);
        expect(testComponent.appLicenses[0]).toEqual("maya");
    }));

    it("Uncheck should not add the license", fakeAsync(() => {
        component.updateSelection(new ListSelection({ keys: ["maya"] }));
        tick();
        component.updateSelection(new ListSelection());
        tick();
        fixture.detectChanges();
        expect(testComponent.appLicenses.length).toEqual(0);
    }));

    describe("EULA", () => {
        it("Calling viewEula opens dialog", () => {
            component.viewEula({ id: "vray", description: "license name" } as any);
            expect(matDialogSpy.open).toHaveBeenCalledTimes(1);
        });
    });

    describe("Validation", () => {
        it("Validation passes if nothing selected", fakeAsync(() => {
            expect(component.validate(null)).toBeNull();
        }));

        it("Validation fails if license selected and checkbox not checked", fakeAsync(() => {
            component.updateSelection(new ListSelection({ keys: ["maya"] }));
            tick();
            fixture.detectChanges();
            expect(component.validate(null)).toEqual({ required: true });
        }));

        it("Validation passes if license selected and checkbox checked", fakeAsync(() => {
            component.updateSelection(new ListSelection({ keys: ["maya"] }));
            tick();
            component.eulaCheck({ checked: true } as MatCheckboxChange);
            tick();
            fixture.detectChanges();
            expect(component.validate(null)).toBeNull();
        }));
    });
});
