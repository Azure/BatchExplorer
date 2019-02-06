import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import {
    I18nTestingModule, MockControlValueAccessorComponent, controlValueAccessorProvider,
} from "@batch-flask/core/testing";
import { NodeAgentSku, PoolOsSkus } from "app/models";
import { PoolOsService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
import { click } from "test/utils/helpers";
import { OsOfferTileComponent } from "../os-offer-tile";
import { OSImagePickerComponent, OSImageSelection } from "./os-image-picker.component";

@Component({
    template: `<bl-os-image-picker [formGroup]="form"></bl-os-image-picker>`,
})
class TestComponent {
    public form = new FormGroup<OSImageSelection>({
        cloudServiceConfiguration: new FormControl(),
        virtualMachineConfiguration: new FormControl(),
    });
}

@Component({
    selector: "bl-custom-image-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeCustomImagePickerComponent)],
})
class FakeCustomImagePickerComponent extends MockControlValueAccessorComponent<any> {

}

const centosSku = new NodeAgentSku({
    id: "batch.node.centos 7",
    verifiedImageReferences: [
        { publisher: "OpenLogic", offer: "CentOS", sku: "7.5", version: "latest" },
        { publisher: "OpenLogic", offer: "CentOS-HPC", sku: "7.4", version: "latest" },
        { publisher: "OpenLogic", offer: "CentOS-HPC", sku: "7.3", version: "latest" },
        { publisher: "OpenLogic", offer: "CentOS-HPC", sku: "7.1", version: "latest" },
        { publisher: "Oracle", offer: "Oracle-Linux", sku: "7.5", version: "latest" },
        { publisher: "microsoft-ads", offer: "linux-data-science-vm", sku: "linuxdsvm", version: "latest" },
        { publisher: "batch", offer: "rendering-centos73", sku: "rendering", version: "latest" },
        { publisher: "microsoft-azure-batch", offer: "centos-container", sku: "7-5", version: "latest" },
        { publisher: "microsoft-azure-batch", offer: "centos-container-rdma", sku: "7-4", version: "latest" },
    ],
    osType: "linux",
});

const windowsSku = new NodeAgentSku({
    id: "batch.node.windows amd64", verifiedImageReferences: [
        // tslint:disable:max-line-length
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2019-Datacenter", version: "latest" },
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2016-Datacenter", version: "latest" },
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2012-R2-Datacenter", version: "latest" },
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2012-Datacenter", version: "latest" },
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2008-R2-SP1", version: "latest" },
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2008-R2-SP1-smalldisk", version: "latest" },
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2019-Datacenter-with-Containers", version: "latest" },
        { publisher: "MicrosoftWindowsServer", offer: "WindowsServer", sku: "2016-Datacenter-with-Containers", version: "latest" },
        { publisher: "microsoft-dsvm", offer: "dsvm-windows", sku: "server-2016", version: "latest" },
        { publisher: "batch", offer: "rendering-windows2016", sku: "rendering", version: "latest" },
        // tslint:enable:max-line-length
    ],
    osType: "windows",
});

const skuSet1 = new PoolOsSkus(List([
    centosSku,
    windowsSku,
]));

describe("OSImagePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let poolOsServiceSpy;

    beforeEach(() => {
        poolOsServiceSpy = {
            offers: new BehaviorSubject(skuSet1),
        };
        TestBed.configureTestingModule({
            imports: [
                MatMenuModule,
                I18nTestingModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
            ],
            declarations: [
                OSImagePickerComponent, OsOfferTileComponent, TestComponent, FakeCustomImagePickerComponent,
            ],
            providers: [
                { provide: PoolOsService, useValue: poolOsServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-os-image-picker"));
        fixture.detectChanges();
    });

    function getTiles(tabIndex: number) {
        const tabs = de.queryAll(By.css("mat-tab"));
        return tabs[tabIndex].queryAll(By.css("bl-os-offer-tile"));
    }

    it("Shows 5 tabs (Distribution, Data science, Rendering, Container,  Custom image)", () => {
        const tabs = de.queryAll(By.css("mat-tab"));
        expect(tabs.length).toBe(5);
    });

    it("shows 1 tile for each Distribution + CLoudService in the distribution tab", () => {
        const tiles = getTiles(0);
        expect(tiles.length).toEqual(5);
        expect(tiles[0].nativeElement.textContent).toContain("CentOS");
        expect(tiles[1].nativeElement.textContent).toContain("CentOS HPC");
        expect(tiles[2].nativeElement.textContent).toContain("Oracle Linux");
        expect(tiles[3].nativeElement.textContent).toContain("WindowsServer");
        expect(tiles[4].nativeElement.textContent).toContain("WindowsServer(Cloud Service)");
    });

    it("shows 1 tile for each Distribution + CLoudService in the container tab", () => {
        const tiles = getTiles(3);
        expect(tiles.length).toEqual(3);
        expect(tiles[0].nativeElement.textContent).toContain("centos container");
        expect(tiles[1].nativeElement.textContent).toContain("centos container rdma");
        expect(tiles[2].nativeElement.textContent).toContain("WindowsServer");
    });

    it("picks the latest cloud service family when clicking on the tile", () => {
        click(de.query(By.css("bl-os-offer-tile.cloudservice .main")));
        fixture.detectChanges();

        expect(de.query(By.css("bl-os-offer-tile.cloudservice")).componentInstance.active).toBeTruthy();

        expect(testComponent.form.value).toEqual({
            cloudServiceConfiguration: {
                osFamily: "6",
            },
            virtualMachineConfiguration: null,
        });
    });

    it("picks the latest virtual machine sku of given offer when cliking on the tile", () => {
        const tiles = getTiles(0);

        click(tiles[1].query(By.css(".main")));

        fixture.detectChanges();
        expect(tiles[1].componentInstance.active).toBe(true);
        expect(tiles[1].componentInstance.selectedSku).toEqual("7.1");

        expect(testComponent.form.value).toEqual({
            cloudServiceConfiguration: null,
            virtualMachineConfiguration: {
                imageReference: {
                    publisher: "OpenLogic",
                    offer: "CentOS-HPC",
                    sku: "7.1",
                },
                nodeAgentSKUId: "batch.node.centos 7",
            },
        });
    });
});
