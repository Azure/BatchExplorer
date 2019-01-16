import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { SelectModule } from "@batch-flask/ui";
import { FormFieldComponent } from "@batch-flask/ui/form/form-field";
import { Subscription as ArmSubscription } from "app/models";
import { SubscriptionService } from "app/services";
import { of } from "rxjs";
import { LocationModule } from "../location";
import { LocationPickerComponent } from "./location-picker.component";

@Component({
    template: `<bl-location-picker [subscription]="subscription" [formControl]="location"></bl-location-picker>`,
})
class TestComponent {
    public location = new FormControl();
    public subscription = new ArmSubscription({ subscriptionId: "dummy-1", displayName: "Dummy one" });
}

describe("LocationPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let locationServiceSpy;

    beforeEach(() => {
        locationServiceSpy = {
            listLocations: jasmine.createSpy("listLocations").and.callFake((sub) => {
                if (sub.subscriptionId === "dummy-1") {
                    return of([
                        { id: "dummy-1-loc-1", name: "eastus1", displayName: "East US", subscriptionId: "dummy-1" },
                        { id: "dummy-1-loc-2", name: "eastus2", displayName: "East US 2", subscriptionId: "dummy-1" },
                        { id: "dummy-1-loc-3", name: "eastus3", displayName: "East US 3", subscriptionId: "dummy-1" },
                        { id: "dummy-1-loc-4", name: "eastus4", displayName: "East US 4", subscriptionId: "dummy-1" },
                    ]);
                } else if (sub.subscriptionId === "dummy-2") {
                    return of([
                        { id: "dummy-2-loc-1", name: "westus1", displayName: "West US", subscriptionId: "dummy-2" },
                        { id: "dummy-2-loc-2", name: "westus2", displayName: "West US 2", subscriptionId: "dummy-2" },
                        { id: "dummy-2-loc-3", name: "westus3", displayName: "West US 3", subscriptionId: "dummy-2" },
                    ]);
                }
                return of([]);
            }),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, SelectModule, LocationModule, I18nTestingModule],
            declarations: [LocationPickerComponent, TestComponent, FormFieldComponent],
            providers: [
                { provide: SubscriptionService, useValue: locationServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-location-picker"));
        fixture.detectChanges();
    });

    function getSelectEl() {
        return de.query(By.css("bl-select"));
    }

    function getSelect() {
        return getSelectEl().componentInstance;
    }

    it("show the select when there is locations", () => {
        expect(getSelectEl()).not.toBeFalsy();
    });

    it("applies the changes to the inputs", () => {
        testComponent.location.setValue("eastus2");
        fixture.detectChanges();
        expect(getSelect().value).toEqual("eastus2");
    });

    it("proagate changes upstream", () => {
        getSelect().selectOption(getSelect().options.toArray()[2]);
        expect(testComponent.location.value).toEqual("eastus3");
    });

    it("show message when subscription has no locations", () => {
        testComponent.subscription = new ArmSubscription({ subscriptionId: "invalid", displayName: "Invalid sub" });
        fixture.detectChanges();

        expect(de.query(By.css("bl-select"))).toBeFalsy();
        expect(de.nativeElement.textContent).toContain("noLocationInSubscription(name:Invalid sub)");
    });
});
