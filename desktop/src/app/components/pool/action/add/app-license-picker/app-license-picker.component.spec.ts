import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialog } from "@angular/material/dialog";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { MaterialModule } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { TableTestingModule } from "@batch-flask/ui/testing";
import { AppLicensePickerComponent } from "app/components/pool/action/add";
import { SoftwareBillingUnit } from "app/models";
import { PricingService } from "app/services";
import { SoftwarePricing } from "app/services/pricing";
import { of } from "rxjs";

@Component({
    template: `<bl-app-license-picker [(ngModel)]="appLicenses"></bl-app-license-picker>`,
})
class TestComponent {
    public appLicenses: string[] = [];
}

const pricing = new SoftwarePricing();
pricing.add("maya", 12, SoftwareBillingUnit.node);
pricing.add("arnold", 5, SoftwareBillingUnit.node);

describe("AppLicensePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: AppLicensePickerComponent;
    let debugElement: DebugElement;
    let matDialogSpy: any;
    let pricingServiceSpy: any;

    beforeEach(() => {
        matDialogSpy = {
            open: jasmine.createSpy("open").and.callFake((...args) => {
                return {
                    componentInstance: { license: null },
                };
            }),
        };

        pricingServiceSpy = {
            getSoftwarePricing: () => of(pricing),
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, MaterialModule, TableTestingModule, ElectronTestingModule, RouterTestingModule],
            declarations: [AppLicensePickerComponent, TestComponent],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: BreadcrumbService, useValue: null },
                { provide: PricingService, useValue: pricingServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css("bl-app-license-picker"));
        component = debugElement.componentInstance;
        fixture.detectChanges();
    });

    it("Should show 4 licenses", () => {
        const tableRows = debugElement.queryAll(By.css("bl-row-render"));
        expect(tableRows.length).toBe(4);

        const row1Columns = tableRows[0].queryAll(By.css(".bl-table-cell"));
        expect(row1Columns.length).toBe(3, "Row has 3 columns");
        expect(row1Columns[0].nativeElement.textContent).toContain("Autodesk Maya");
        expect(row1Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row1Columns[2].nativeElement.textContent).toContain("$12/node/hour");

        const row2Columns = tableRows[1].queryAll(By.css(".bl-table-cell"));
        expect(row2Columns[0].nativeElement.textContent).toContain("Autodesk 3ds Max");
        expect(row2Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row2Columns[2].nativeElement.textContent).toContain("-");

        const row3Columns = tableRows[2].queryAll(By.css(".bl-table-cell"));
        expect(row3Columns[0].nativeElement.textContent).toContain("Autodesk Arnold");
        expect(row3Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row3Columns[2].nativeElement.textContent).toContain("$5/node/hour");

        const row4Columns = tableRows[3].queryAll(By.css(".bl-table-cell"));
        expect(row4Columns[0].nativeElement.textContent).toContain("Chaos Group V-Ray & V-Ray RT");
        expect(row4Columns[1].nativeElement.textContent).toContain("EULA");
        expect(row4Columns[2].nativeElement.textContent).toContain("-");
    });

    it("Should select license by checking checkbox", () => {
        component.updateSelection(new ListSelection({ keys: ["maya"] }));
        fixture.detectChanges();
        expect(testComponent.appLicenses.length).toEqual(1);
        expect(testComponent.appLicenses[0]).toEqual("maya");
    });

    it("Uncheck should not add the license", () => {
        component.updateSelection(new ListSelection({ keys: ["maya"] }));
        component.updateSelection(new ListSelection());
        fixture.detectChanges();
        expect(testComponent.appLicenses.length).toEqual(0);
    });

    describe("EULA", () => {
        it("Calling viewEula opens dialog", () => {
            component.viewEula({ id: "vray", description: "license name" } as any);
            expect(matDialogSpy.open).toHaveBeenCalledTimes(1);
        });
    });

    describe("Validation", () => {
        it("Validation passes if nothing selected", () => {
            expect(component.validate(null)).toBeNull();
        });

        it("Validation fails if license selected and checkbox not checked", () => {
            component.updateSelection(new ListSelection({ keys: ["maya"] }));
            fixture.detectChanges();
            expect(component.validate(null)).toEqual({ required: true });
        });

        it("Validation passes if license selected and checkbox checked", () => {
            component.updateSelection(new ListSelection({ keys: ["maya"] }));
            component.eulaCheck({ checked: true } as MatCheckboxChange);
            fixture.detectChanges();
            expect(component.validate(null)).toBeNull();
        });
    });
});
