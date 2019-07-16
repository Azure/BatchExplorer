import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { ArmBatchAccount, ArmSubscription, NodeAgentSku, Resource } from "app/models";
import { ArmSharedImageGalleryVersion, BatchAccountService, ComputeService, PoolOsService } from "app/services";
import { List } from "immutable";
import { of } from "rxjs";
import { CustomImagePickerComponent } from "./custom-image-picker.component";

@Component({
    template: `<bl-custom-image-picker [formControl]="control"></bl-custom-image-picker>`,
})
class TestComponent {
    public control = new FormControl();
}

const sub1 = new ArmSubscription({ id: "/subs/sub-1", subscriptionId: "sub-1" });

const images: Resource[] = [
    {
        id: "/sub/sub-1/resources/image-1",
        location: "westus",
        name: "Ubuntu custom image",
        type: "Microsoft.Compute/image",
    },
    {
        id: "/sub/sub-1/resources/image-2",
        location: "westus",
        name: "CentOS custom image",
        type: "Microsoft.Compute/image",
    },
];

const sigVersions: Resource[] = [
    {
        id: "/sub/sub-1/resources/test/providers/Microsoft.Compute/galleries/test/images/tesimage/versions/1.12.1",
        name: "test/testimage/1.12.1",
        type: "Microsoft.Compute/galleries/images/versions",
        location: "westus",
    },
];

const skus = [
    new NodeAgentSku({ id: "batch.centos" }),
    new NodeAgentSku({ id: "batch.ubuntu" }),
    new NodeAgentSku({ id: "batch.windows" }),
];

describe("CustomImagePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let imageSelectEl: DebugElement;
    let nodeAgentSkuSelectEl: DebugElement;
    let imageSelect: SelectComponent;
    let nodeAgentSkuSelect: SelectComponent;
    let computeServiceSpy;
    let poolOSServiceSpy;
    let accountServiceSpy;

    beforeEach(() => {
        computeServiceSpy = {
            listCustomImages: jasmine.createSpy("listCustomImages").and.returnValue(of(images)),
            listSIG: jasmine.createSpy("listSIG").and.returnValue(of(sigVersions)),
        };

        poolOSServiceSpy = {
            nodeAgentSkus: of(List(skus)),
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
            declarations: [CustomImagePickerComponent, TestComponent],
            providers: [
                { provide: ComputeService, useValue: computeServiceSpy },
                { provide: PoolOsService, useValue: poolOSServiceSpy },
                { provide: BatchAccountService, useValue: accountServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-custom-image-picker"));
        fixture.detectChanges();

        imageSelectEl = de.query(By.css(".image-id-picker"));
        nodeAgentSkuSelectEl = de.query(By.css(".node-agent-sku-picker"));

        imageSelect = imageSelectEl && imageSelectEl.componentInstance;
        nodeAgentSkuSelect = nodeAgentSkuSelectEl && nodeAgentSkuSelectEl.componentInstance;
    });

    it("has all the forms element", () => {
        expect(imageSelectEl).not.toBeFalsy();
        expect(nodeAgentSkuSelectEl).not.toBeFalsy();
    });

    it("list the available images", () => {
        expect(imageSelect.options.length).toEqual(2);
        const options = imageSelect.options.toArray();
        expect(options[0].label).toEqual("Ubuntu custom image");
        expect(options[1].label).toEqual("CentOS custom image");
        expect(options[1].label).toEqual("test/testimage/1.12.1");
    });

    it("list the available skus", () => {
        expect(nodeAgentSkuSelect.options.length).toEqual(3);
        const options = nodeAgentSkuSelect.options.toArray();
        expect(options[0].label).toEqual("batch.centos");
        expect(options[1].label).toEqual("batch.ubuntu");
        expect(options[2].label).toEqual("batch.windows");
    });

    it("updating select will emit value", () => {
        imageSelect.selectOption(imageSelect.options.toArray()[0]);
        expect(testComponent.control.value).toEqual({
            imageId: images[0].id,
            nodeAgentSku: null,
        });
        nodeAgentSkuSelect.selectOption(nodeAgentSkuSelect.options.toArray()[1]);
        expect(testComponent.control.value).toEqual({
            imageId: images[0].id,
            nodeAgentSku: "batch.ubuntu",
        });
    });

    it("updates select when updating parent compoennt", () => {
        testComponent.control.setValue({
            imageId: images[1].id,
            nodeAgentSku: "batch.centos",
        });
        fixture.detectChanges();
        expect(imageSelect.firstSelection).toEqual(imageSelect.options.toArray()[1]);
        expect(nodeAgentSkuSelect.firstSelection).toEqual(nodeAgentSkuSelect.options.toArray()[0]);
    });
});
