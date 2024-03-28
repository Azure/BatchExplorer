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
