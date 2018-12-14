import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material";
import { BrowserModule, By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, I18nUIModule, SelectModule } from "@batch-flask/ui";
import { Certificate, CertificateReferenceAttributes } from "app/models";
import { CertificateService } from "app/services";
import { List } from "immutable";
import { of } from "rxjs";
import { CertificatePickerComponent } from "./certificate-picker";
import { CertificateReferencesPickerComponent, TrimThumbprintPipe } from "./certificate-references-picker.component";

@Component({
    template: `
        <bl-complex-form>
            <bl-form-page main-form-page>
                <bl-form-section>
                    <bl-certificate-references-picker [formControl]="references"></bl-certificate-references-picker>
                </bl-form-section>
            </bl-form-page>
        </bl-complex-form>
    `,
})
class TestComponent {
    public references = new FormControl<CertificateReferenceAttributes[]>();
}

const certificates: Certificate[] = [
    new Certificate({ thumbprint: "abcdefabcdefabcdefabcdefabcdef", thumbprintAlgorithm: "sha-1" }),
    new Certificate({ thumbprint: "defdefdefdefdefdefdefdefdefdef", thumbprintAlgorithm: "sha-1" }),
];

fdescribe("CertificateReferencesPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: CertificateReferencesPickerComponent;
    let de: DebugElement;
    let certificateServiceSpy;
    let availableCertificates: Certificate[];

    beforeEach(() => {
        availableCertificates = certificates;
        certificateServiceSpy = {
            listAll: jasmine.createSpy("listAll").and.callFake(() => of(List(availableCertificates))),
        };

        TestBed.configureTestingModule({
            imports: [
                BrowserModule, FormModule, ReactiveFormsModule, FormsModule,
                I18nTestingModule, I18nUIModule, SelectModule, MatAutocompleteModule,
            ],
            declarations: [
                CertificateReferencesPickerComponent, CertificatePickerComponent, TestComponent, TrimThumbprintPipe,
            ],
            providers: [
                { provide: CertificateService, useValue: certificateServiceSpy },
            ],
        });

        setup();
    });

    function setup() {
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css("bl-certificate-references-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    }

    it("shows a warning when there is no certificates", () => {
        availableCertificates = [];
        setup();
        expect(de.nativeElement.textContent).toContain("certificate-references-picker.noCertificates");
        expect(de.nativeElement.textContent).not.toContain("certificate-references-picker.addOne");
    });

    it("shows add a new certificate button when there is certificates", () => {
        expect(de.nativeElement.textContent).toContain("certificate-references-picker.addOne");
        expect(de.nativeElement.textContent).not.toContain("certificate-references-picker.noCertificates");
    });

    it("shows selected references", () => {
        testComponent.references.setValue([
            {
                thumbprint: certificates[0].thumbprint,
                thumbprintAlgorithm: "sha-1",
                storeLocation: "FOo",
                storeName: "My",
                visibility: ["User"],
            },
        ]);

        // Trimed the thumbprint
        expect(de.nativeElement.textContent).toContain("abcdefabcdefabc");
        expect(de.nativeElement.textContent).not.toContain("abcdefabcdefabcdefabcdef");

    });
});
