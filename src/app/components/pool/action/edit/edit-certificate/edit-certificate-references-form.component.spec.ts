import { Component, DebugElement, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule, By } from "@angular/platform-browser";
import {
    I18nTestingModule, MockControlValueAccessorComponent, controlValueAccessorProvider,
} from "@batch-flask/core/testing";
import { FormModule, SidebarRef } from "@batch-flask/ui";
import { CertificateReferenceAttributes, CertificateStoreLocation, CommonStoreName, Pool } from "app/models";
import { PoolPatchDto } from "app/models/dtos";
import { CertificateReferenceDto } from "app/models/dtos/certificate-reference.dto";
import { NodeService, PoolService } from "app/services";
import { of } from "rxjs";
import { NotificationServiceMock } from "test/utils/mocks";
import { EditCertificateReferencesComponent } from "./edit-certificate-references-form.component";

@Component({
    selector: "bl-certificate-references-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeCertificateReferencesPickerComponent)],
})
class FakeCertificateReferencesPickerComponent
    extends MockControlValueAccessorComponent<CertificateReferenceAttributes[]> {

    @Input() public pool: Pool;

}

describe("EditAppPackageFormComponent", () => {
    let fixture: ComponentFixture<EditCertificateReferencesComponent>;
    let component: EditCertificateReferencesComponent;
    let de: DebugElement;
    let pickerEl: DebugElement;
    let pickerComponent: FakeCertificateReferencesPickerComponent;

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
            imports: [FormsModule, ReactiveFormsModule, BrowserModule, FormModule, I18nTestingModule],
            declarations: [EditCertificateReferencesComponent, FakeCertificateReferencesPickerComponent],
            providers: [
                { provide: SidebarRef, useValue: sidebarRefSpy },
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: NodeService, useValue: nodeServiceSpy },
                notificationServiceSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(EditCertificateReferencesComponent);
        de = fixture.debugElement;
        component = de.componentInstance;

        component.pool = new Pool({
            id: "pool-1",
            certificateReferences: [
                {
                    thumbprint: "abcdef",
                    thumbprintAlgorithm: "sha-1",
                    storeLocation: CertificateStoreLocation.CurrentUser,
                    storeName: CommonStoreName.CA,
                    visibility: ["task"],
                },
                {
                    thumbprint: "foobar",
                    thumbprintAlgorithm: "sha-1",
                    storeLocation: CertificateStoreLocation.LocalMachine,
                    storeName: CommonStoreName.CA,
                    visibility: ["task"],
                },
            ],
        });
        fixture.detectChanges();

        pickerEl = de.query(By.css("bl-certificate-references-picker"));
        pickerComponent = pickerEl.componentInstance;
    });

    it("preset the picker with the pool app packages", () => {
        expect(pickerComponent.value).toEqual([
            {
                thumbprint: "abcdef",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.CurrentUser,
                storeName: CommonStoreName.CA,
                visibility: ["task"],
            },
            {
                thumbprint: "foobar",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.LocalMachine,
                storeName: CommonStoreName.CA,
                visibility: ["task"],
            },
        ]);
    });

    it("updates the form when updating the picker", () => {
        pickerComponent.updateValue([
            {
                thumbprint: "abcdef",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.CurrentUser,
                storeName: CommonStoreName.CA,
                visibility: ["task"],
            },
            {
                thumbprint: "foobar",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.LocalMachine,
                storeName: CommonStoreName.CA,
                visibility: ["task"],
            },
            {
                thumbprint: "othercert",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.LocalMachine,
                storeName: CommonStoreName.CA,
                visibility: ["pool"],
            },
        ]);
        fixture.detectChanges();
        expect(component.references.value).toEqual([
            {
                thumbprint: "abcdef",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.CurrentUser,
                storeName: CommonStoreName.CA,
                visibility: ["task"],
            },
            {
                thumbprint: "foobar",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.LocalMachine,
                storeName: CommonStoreName.CA,
                visibility: ["task"],
            },
            {
                thumbprint: "othercert",
                thumbprintAlgorithm: "sha-1",
                storeLocation: CertificateStoreLocation.LocalMachine,
                storeName: CommonStoreName.CA,
                visibility: ["pool"],
            },
        ]);
    });

    it("patch the pool when submitting", () => {
        component.submit().subscribe();
        expect(poolServiceSpy.patch).toHaveBeenCalledOnce();
        expect(poolServiceSpy.patch).toHaveBeenCalledWith("pool-1", new PoolPatchDto({
            certificateReferences: [
                new CertificateReferenceDto({
                    thumbprint: "abcdef",
                    thumbprintAlgorithm: "sha-1",
                    storeLocation: CertificateStoreLocation.CurrentUser,
                    storeName: CommonStoreName.CA,
                    visibility: ["task"],
                }),
                new CertificateReferenceDto({
                    thumbprint: "foobar",
                    thumbprintAlgorithm: "sha-1",
                    storeLocation: CertificateStoreLocation.LocalMachine,
                    storeName: CommonStoreName.CA,
                    visibility: ["task"],
                }),
            ],
        }));
        expect(notificationServiceSpy.success).toHaveBeenCalledOnce();
        expect(notificationServiceSpy.success).toHaveBeenCalledWith(
            "common.updated",
            "edit-certificate-references-form.updated(poolId:pool-1)",
            jasmine.objectContaining({ persist: true }),
        );

        const notifcation = notificationServiceSpy.lastNotification;

        expect(notifcation.config.actions.length).toEqual(1);
        expect(notifcation.config.actions[0].name).toEqual("common.rebootAll");

        expect(nodeServiceSpy.rebootAll).not.toHaveBeenCalled();
        notifcation.config.actions[0].do();
        expect(nodeServiceSpy.rebootAll).toHaveBeenCalledOnce();
    });
});
