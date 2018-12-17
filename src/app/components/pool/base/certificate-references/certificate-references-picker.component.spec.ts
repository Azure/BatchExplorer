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
import { click } from "test/utils/helpers";
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

describe("CertificateReferencesPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
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
        fixture.detectChanges();
    }

    function getButtons() {
        return de.queryAll(By.css(".form-picker"));
    }

    it("shows a warning when there is no certificates", () => {
        availableCertificates = [];
        setup();
        expect(de.nativeElement.textContent).toContain("certificate-references-picker.noCertificates");
        const buttons = getButtons();
        expect(buttons.length).toEqual(0);
        expect(de.nativeElement.textContent).not.toContain("certificate-references-picker.addOne");
    });

    it("shows add a new certificate button when there is certificates", () => {
        const buttons = getButtons();
        expect(buttons.length).toEqual(1);
        expect(buttons[0].nativeElement.textContent).toContain("certificate-references-picker.addOne");
        expect(de.nativeElement.textContent).not.toContain("certificate-references-picker.noCertificates");
    });

    it("opens the edit form when clicking on add one", () => {
        let buttons = getButtons();
        click(buttons[0]);
        fixture.detectChanges();
        const certPicker = fixture.debugElement.query(By.css("bl-certificate-picker"));
        expect(certPicker).not.toBeFalsy();
        certPicker.componentInstance.form.setValue({
            thumbprint: certificates[0].thumbprint,
            thumbprintAlgorithm: "sha-1",
            storeLocation: "FOo",
            storeName: "My",
            visibility: ["User"],
        });
        fixture.detectChanges();
        click(fixture.debugElement.query(By.css("bl-button.select")));
        fixture.detectChanges();

        buttons = getButtons();
        expect(buttons.length).toBe(2);
        // Trimed the thumbprint
        expect(buttons[0].nativeElement.textContent).toContain("abcdefabcdefabc");
        expect(buttons[1].nativeElement.textContent).toContain("certificate-references-picker.addOne");
    });

    describe("when certificate is preselected", () => {
        beforeEach(() => {
            testComponent.references.setValue([
                {
                    thumbprint: certificates[0].thumbprint,
                    thumbprintAlgorithm: "sha-1",
                    storeLocation: "FOo",
                    storeName: "My",
                    visibility: ["User"],
                },
            ]);
            fixture.detectChanges();
        });

        it("shows selected references", () => {
            const buttons = getButtons();

            // Trimed the thumbprint buttons = getButtons();
            expect(buttons.length).toBe(2);
            // Trimed the thumbprint
            expect(buttons[0].nativeElement.textContent).toContain("abcdefabcdefabc");
            expect(buttons[0].nativeElement.textContent).not.toContain("abcdefabcdefabcdefabcdef");
            expect(buttons[1].nativeElement.textContent).toContain("certificate-references-picker.addOne");
            expect(de.nativeElement.textContent).toContain("abcdefabcdefabc");
        });

        it("remove certificate when clicking delete", () => {
            let buttons = getButtons();
            click(buttons[0].query(By.css(".clear-btn")));
            fixture.detectChanges();
            buttons = getButtons();
            expect(buttons.length).toBe(1);
            expect(buttons[0].nativeElement.textContent).toContain("certificate-references-picker.addOne");
        });
    });
});
