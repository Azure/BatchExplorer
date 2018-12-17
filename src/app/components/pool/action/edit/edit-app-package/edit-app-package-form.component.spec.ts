import { Component, DebugElement, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule, By } from "@angular/platform-browser";
import {
    I18nTestingModule, MockControlValueAccessorComponent, controlValueAccessorProvider,
} from "@batch-flask/core/testing";
import { FormModule, I18nUIModule, SidebarRef } from "@batch-flask/ui";
import { ApplicationPackageReferenceAttributes, Pool } from "app/models";
import { PoolPatchDto } from "app/models/dtos";
import { NodeService, PoolService } from "app/services";
import { of } from "rxjs";
import { NotificationServiceMock } from "test/utils/mocks";
import { EditAppPackageFormComponent } from "./edit-app-package-form.component";

@Component({
    selector: "bl-app-package-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeAppPackagePickerComponent)],
})
class FakeAppPackagePickerComponent extends MockControlValueAccessorComponent<ApplicationPackageReferenceAttributes[]> {
    @Input() public pool: Pool;

}

describe("EditAppPackageFormComponent", () => {
    let fixture: ComponentFixture<EditAppPackageFormComponent>;
    let component: EditAppPackageFormComponent;
    let de: DebugElement;
    let pickerEl: DebugElement;
    let pickerComponent: FakeAppPackagePickerComponent;

    let sidebarRefSpy;

    let nodeServiceSpy;
    let poolServiceSpy;
    let notificationServiceSpy: NotificationServiceMock;

    beforeEach(() => {
        sidebarRefSpy = {};
        notificationServiceSpy = new NotificationServiceMock();
        nodeServiceSpy = {
            rebootAll: jasmine.createSpy("rebootAll").and.returnValue(of(null)),
        };
        poolServiceSpy = {
            get: jasmine.createSpy("get").and.returnValue(of(null)),
            patch: jasmine.createSpy("patch").and.returnValue(of(null)),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, BrowserModule, FormModule, I18nTestingModule, I18nUIModule],
            declarations: [EditAppPackageFormComponent, FakeAppPackagePickerComponent],
            providers: [
                { provide: SidebarRef, useValue: sidebarRefSpy },
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: NodeService, useValue: nodeServiceSpy },
                notificationServiceSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(EditAppPackageFormComponent);
        de = fixture.debugElement;
        component = de.componentInstance;

        component.pool = new Pool({
            id: "pool-1",
            applicationPackageReferences: [
                { applicationId: "foo", version: "1.3" },
                { applicationId: "bar", version: "9.2" },
            ],
        });
        fixture.detectChanges();

        pickerEl = de.query(By.css("bl-app-package-picker"));
        pickerComponent = pickerEl.componentInstance;
    });

    it("preset the picker with the pool app packages", () => {
        expect(pickerComponent.value).toEqual([
            { applicationId: "foo", version: "1.3" },
            { applicationId: "bar", version: "9.2" },
        ]);
    });

    it("updates the form when updating the picker", () => {
        pickerComponent.updateValue([
            { applicationId: "foo", version: "1.3" },
            { applicationId: "bar", version: "9.2" },
            { applicationId: "other", version: "1.3.2" },
        ]);
        fixture.detectChanges();
        expect(component.appPackages.value).toEqual([
            { applicationId: "foo", version: "1.3" },
            { applicationId: "bar", version: "9.2" },
            { applicationId: "other", version: "1.3.2" },
        ]);
    });

    it("patch the pool when submitting", () => {
        component.submit().subscribe();
        expect(poolServiceSpy.patch).toHaveBeenCalledOnce();
        expect(poolServiceSpy.patch).toHaveBeenCalledWith("pool-1", new PoolPatchDto({
            applicationPackageReferences: [
                { applicationId: "foo", version: "1.3" },
                { applicationId: "bar", version: "9.2" },
            ],
        }));
        expect(notificationServiceSpy.success).toHaveBeenCalledOnce();
        expect(notificationServiceSpy.success).toHaveBeenCalledWith(
            "common.updated",
            "edit-app-package-form.updated(poolId:pool-1)",
            jasmine.objectContaining({ persist: true }),
        );

        const notifcation = notificationServiceSpy.lastNotification;

        expect(notifcation.config.actions.length).toEqual(1);
        expect(notifcation.config.actions[0].name).toEqual("edit-app-package-form.rebootAll");

        expect(nodeServiceSpy.rebootAll).not.toHaveBeenCalled();
        notifcation.config.actions[0].do();
        expect(nodeServiceSpy.rebootAll).toHaveBeenCalledOnce();
    });
});
