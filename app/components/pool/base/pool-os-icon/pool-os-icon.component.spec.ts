import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTooltip, MatTooltipModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Pool } from "app/models";
import { PoolOsIconComponent } from "./pool-os-icon.component";

const ubuntuPool = new Pool({
    id: "ubuntu-pool",
    virtualMachineConfiguration: {
        imageReference: {
            offer: "UbuntuServer",
            publisher: "Canonical",
            sku: "16.04-LTS",
            version: "latest",
        },
        nodeAgentSKUId: "batch.node.ubuntu 16.04",
    },
});

const windowsServerPool = new Pool({
    id: "windows-server-pool",
    virtualMachineConfiguration: {
        imageReference: {
            offer: "WindowsServer",
            publisher: "MicrosoftWindowsServer",
            sku: "2016-Datacenter",
            version: "latest",
        },
        nodeAgentSKUId: "batch.node.windows amd64",
    },
});

const windowsCustomImage = new Pool({
    id: "windows-server-pool",
    virtualMachineConfiguration: {
        imageReference: {
            virtualMachineImageId: "some-windows-image-id",
        },
        nodeAgentSKUId: "batch.node.windows amd64",
    },
});

const linuxCustomImage = new Pool({
    id: "windows-server-pool",
    virtualMachineConfiguration: {
        imageReference: {
            virtualMachineImageId: "some-windows-image-id",
        },
        nodeAgentSKUId: "batch.node.centos 7",
    },
});

@Component({
    template: `<bl-pool-os-icon [pool]="pool"></bl-pool-os-icon>`,
})
class TestComponent {
    public pool: Pool = ubuntuPool;
}

describe("PoolOsIconComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: PoolOsIconComponent;
    let de: DebugElement;
    let iconEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatTooltipModule],
            declarations: [PoolOsIconComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-os-icon"));
        component = de.componentInstance;
        fixture.detectChanges();
        iconEl = de.query(By.css(".fa"));
    });

    describe("when pool is ubuntu", () => {
        beforeEach(() => {
            testComponent.pool = ubuntuPool;
            fixture.detectChanges();
        });

        it("shows linux icon", () => {
            expect(iconEl.nativeElement.classList).toContain("fa-linux");
        });

        it("shows os in tooltip", () => {
            expect(iconEl.injector.get(MatTooltip).message).toEqual("UbuntuServer 16.04-LTS");
        });
    });

    describe("when pool is windows server", () => {
        beforeEach(() => {
            testComponent.pool = windowsServerPool;
            fixture.detectChanges();
        });

        it("shows windows icon", () => {
            expect(iconEl.nativeElement.classList).toContain("fa-windows");
        });

        it("shows os in tooltip", () => {
            expect(iconEl.injector.get(MatTooltip).message).toEqual("Windows Server 2016-Datacenter");
        });
    });

    describe("when pool is custom image(Linux)", () => {
        beforeEach(() => {
            testComponent.pool = linuxCustomImage;
            fixture.detectChanges();
        });

        it("shows linux icon", () => {
            expect(iconEl.nativeElement.classList).toContain("fa-linux");
        });

        it("shows os in tooltip", () => {
            expect(iconEl.injector.get(MatTooltip).message).toEqual("Custom image (linux)");
        });
    });

    describe("when pool is custom image(Windows)", () => {
        beforeEach(() => {
            testComponent.pool = windowsCustomImage;
            fixture.detectChanges();
        });

        it("shows windows icon", () => {
            expect(iconEl.nativeElement.classList).toContain("fa-windows");
        });

        it("shows os in tooltip", () => {
            expect(iconEl.injector.get(MatTooltip).message).toEqual("Custom image (windows)");
        });
    });
});
