import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { ArmBatchAccount, ArmSubscription, ImageInformation, Resource } from "app/models";
import { BatchAccountService, ComputeService, PoolOsService } from "app/services";
import { List } from "immutable";
import { of } from "rxjs";
import { SigImagePickerComponent } from "./sig-image-picker.component";

@Component({
    template: `<bl-sig-image-picker [formControl]="control"></bl-sig-image-picker>`,
})
class TestComponent {
    public control = new FormControl();
}

const sub1 = new ArmSubscription({ id: "/subs/sub-1", subscriptionId: "sub-1" });

const sigVersions: Resource[] = [
    {
        id: "/sub/sub-1/resources/test/providers/Microsoft.Compute/galleries/test/images/testimage/versions/1.12.1",
        name: "test/testimage/1.12.1",
        type: "Microsoft.Compute/galleries/images/versions",
        location: "westus",
    },
    {
        id: "/sub/sub-1/resources/test/providers/Microsoft.Compute/galleries/test/images/testimage/versions/1.12.2",
        name: "test/testimage/1.12.2",
        type: "Microsoft.Compute/galleries/images/versions",
        location: "westus",
    },
];

const skus = [
    new ImageInformation({nodeAgentSKUId: "batch.centos" }),
    new ImageInformation({nodeAgentSKUId:  "batch.ubuntu" }),
    new ImageInformation({nodeAgentSKUId:  "batch.windows" }),
];

describe("SigImagePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let imageSelectEl: DebugElement;
    let imageInformationSelectEl: DebugElement;
    let imageSelect: SelectComponent;
    let imageInformationSelect: SelectComponent;
    let computeServiceSpy;
    let poolOSServiceSpy;
    let accountServiceSpy;

    beforeEach(() => {
        computeServiceSpy = {
            listSIG: jasmine.createSpy("listSIG").and.returnValue(of(sigVersions)),
        };

        poolOSServiceSpy = {
            supportedImages: of(List(skus)),
        };

        accountServiceSpy = {
            currentAccount: of(new ArmBatchAccount({
                id: "subs/sub1/batchAccounts/acc-1",
                location: "westus",
                name: "My account",
                subscription: sub1,
                properties: { accountEndpoint: "https://endpoint.batch.azure.com" },
            } as any)),
        };
        TestBed.configureTestingModule({
            imports: [SelectModule, ReactiveFormsModule, FormsModule, FormModule, I18nTestingModule],
            declarations: [SigImagePickerComponent, TestComponent],
            providers: [
                { provide: ComputeService, useValue: computeServiceSpy },
                { provide: PoolOsService, useValue: poolOSServiceSpy },
                { provide: BatchAccountService, useValue: accountServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-sig-image-picker"));
        fixture.detectChanges();

        imageSelectEl = de.query(By.css(".image-id-picker"));
        imageInformationSelectEl = de.query(By.css(".node-agent-sku-picker"));

        imageSelect = imageSelectEl && imageSelectEl.componentInstance;
        imageInformationSelect = imageInformationSelectEl && imageInformationSelectEl.componentInstance;
    });

    it("has all the forms element", () => {
        expect(imageSelectEl).not.toBeFalsy();
        expect(imageInformationSelectEl).not.toBeFalsy();
    });

    it("list the available images", () => {
        expect(imageSelect.options.length).toEqual(2);
        const options = imageSelect.options.toArray();
        expect(options[0].label).toEqual("test/testimage/1.12.1");
        expect(options[1].label).toEqual("test/testimage/1.12.2");
    });

    it("list the available skus", () => {
        expect(imageInformationSelect.options.length).toEqual(3);
        const options = imageInformationSelect.options.toArray();
        expect(options[0].label).toEqual("batch.centos");
        expect(options[1].label).toEqual("batch.ubuntu");
        expect(options[2].label).toEqual("batch.windows");
    });

    it("updating select will emit value", () => {
        imageSelect.selectOption(imageSelect.options.toArray()[0]);
        expect(testComponent.control.value).toEqual({
            imageId: sigVersions[0].id,
            nodeAgentSku: null,
        });
        imageInformationSelect.selectOption(imageInformationSelect.options.toArray()[1]);
        expect(testComponent.control.value).toEqual({
            imageId: sigVersions[0].id,
            nodeAgentSku: "batch.ubuntu",
        });
    });

    it("updates select when updating parent component", () => {
        testComponent.control.setValue({
            imageId: sigVersions[1].id,
            nodeAgentSku: "batch.centos",
        });
        fixture.detectChanges();
        expect(imageSelect.firstSelection).toEqual(imageSelect.options.toArray()[1]);
        expect(imageInformationSelect.firstSelection).toEqual(imageInformationSelect.options.toArray()[0]);
    });
});
