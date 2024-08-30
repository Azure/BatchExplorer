import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { of } from "rxjs";
import { AuthService } from "app/services";
import { TenantPickerComponent } from "./tenant-picker.component";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { TenantCardComponent } from ".";
import { By } from "@angular/platform-browser";

@Component({
    template: `<be-tenant-picker></be-tenant-picker>`,
})
class TestComponent {
}

describe("TenantPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let component: TenantPickerComponent;
    let authServiceMock: any;

    beforeEach(async () => {
        authServiceMock = {
            isLoggedIn: jasmine.createSpy("isLoggedIn").and.returnValue(of(true)),
            getTenantAuthorizations:
                jasmine.createSpy("getTenantAuthorizations")
                .and.returnValue(of([]))
        };

        await TestBed.configureTestingModule({
            imports: [
                I18nTestingModule,
            ],
            declarations: [
                TenantPickerComponent,
                TenantCardComponent,
                TestComponent,
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock }
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("be-tenant-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should initialize tenantSettings form control", () => {
        expect(component.tenantSettings.value).toEqual([]);
    });

    it("should call fetchTenantAuthorizations on initialization if logged in", () => {
        expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
        expect(authServiceMock.getTenantAuthorizations).toHaveBeenCalled();
    });

    it("should propagate changes when tenantSettings value changes", () => {
        const propagateChangeSpy = jasmine.createSpy("propagateChange");
        component.registerOnChange(propagateChangeSpy);

        const newValue = [{ tenantId: "1", authorization: "auth1" }];
        component.tenantSettings.setValue(newValue);

        expect(propagateChangeSpy).toHaveBeenCalledWith(newValue);
    });

    it("should call fetchTenantAuthorizations with reauthenticate on refresh", () => {
        const fetchTenantAuthorizationsSpy =
            spyOn<any>(component, "fetchTenantAuthorizations")
                .and.callThrough();
        component.refresh();
        expect(fetchTenantAuthorizationsSpy).toHaveBeenCalledWith({ reauthenticate: true });
    });

    it("should call fetchTenantAuthorizations with specific tenant on refreshTenant", () => {
        const fetchTenantAuthorizationsSpy =
            spyOn<any>(component, "fetchTenantAuthorizations").and.callThrough();
        const refreshData = { tenantId: "1", reauthenticate: true };
        component.refreshTenant(refreshData);
        expect(fetchTenantAuthorizationsSpy).toHaveBeenCalledWith(refreshData);
    });

    it("should clean up on destroy", () => {
        const destroySpy = spyOn(component["_destroy"], "next");
        const completeSpy = spyOn(component["_destroy"], "complete");
        component.ngOnDestroy();
        expect(destroySpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
    });
});
