import { ChangeDetectorRef, Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { UserConfigurationService } from "@batch-flask/core";
import { ClipboardService, ElectronShell } from "@batch-flask/electron";
import { ClickableComponent } from "@batch-flask/ui/buttons";
import { PropertyGroupComponent, TextPropertyComponent } from "@batch-flask/ui/property-list";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { ConnectionType, Node, NodeConnectionSettings } from "app/models";
import { AddNodeUserAttributes } from "app/services";
import {
    NodeConnectService,
} from "app/services/node-connect";
import { BehaviorSubject, of } from "rxjs";
import * as Fixtures from "test/fixture";
import { NodePropertyDisplayComponent } from ".";

@Component({
    template: `<bl-node-property-display
        [connectionSettings]="connectionSettings"
        [node]="node"
        [publicKeyFile]="publicKeyFile"
        [(usingSSHKeys)]="usingSSHKeys"
        [credentials]="credentials"
        (credentialsChange)="updateCredentials($event)"
    ></bl-node-property-display>`,
})
class TestComponent {
    public connectionSettings: NodeConnectionSettings;
    public node: Node;
    public publicKeyFile: string;
    public usingSSHKeys: boolean;
    public credentials: AddNodeUserAttributes;
}

describe("NodePropertyDisplay", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: NodePropertyDisplayComponent;
    let de: DebugElement;

    let electronShellSpy;
    let nodeConnectServiceSpy;
    let settingsServiceSpy;
    let pubKeySubject: BehaviorSubject<string>;

    beforeEach(() => {
        pubKeySubject = new BehaviorSubject("baz");

        electronShellSpy = {
            openItem: jasmine.createSpy("").and.returnValue(true),
            showItemInFolder: jasmine.createSpy("").and.returnValue(true),
        };

        nodeConnectServiceSpy = {
            saveRdpFile: jasmine.createSpy("").and.returnValue(of("path/to/file")),
            getPublicKey: keyFile => pubKeySubject,
        };

        settingsServiceSpy = {
            current: {
                nodeConnect: { defaultUsername: "foo" },
            },
        };

        TestBed.configureTestingModule({
            declarations: [
                NodePropertyDisplayComponent, TextPropertyComponent,
                PropertyGroupComponent, ClickableComponent, TestComponent,
            ],
            providers: [
                { provide: SidebarRef, useValue: null },
                { provide: ElectronShell, useValue: electronShellSpy },
                { provide: NodeConnectService, useValue: nodeConnectServiceSpy },
                ChangeDetectorRef,
                { provide: ClipboardService, useValue: {} },
                { provide: UserConfigurationService, useValue: settingsServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-node-property-display"));
        component = de.componentInstance;

        // test component defaults
        testComponent.credentials = {
            name: "foo",
            password: "bar",
            sshPublicKey: "baz",
        };
        testComponent.connectionSettings = {
            ip: "0.0.0.0",
            port: 50000,
            type: ConnectionType.SSH,
        } as NodeConnectionSettings;
        testComponent.usingSSHKeys = true;
        testComponent.node = Fixtures.node.create();
        testComponent.publicKeyFile = "beep";
        fixture.detectChanges();
    });

    describe("when pool is iaas linux", () => {
        beforeEach(() => {
            testComponent.connectionSettings = {
                ip: "0.0.0.0",
                port: 50000,
                type: ConnectionType.SSH,
            } as NodeConnectionSettings;
            testComponent.usingSSHKeys = true;
            fixture.detectChanges();
        });

        it("should display ssh info", () => {
            const display = de.query(By.css("#ssh-command")).componentInstance;
            expect(display.value).toEqual("ssh foo@0.0.0.0 -p 50000");
        });

        it("if ssh key detected, should display button with prompt to switch to password", () => {
            const button = de.query(By.css(".switch-strategy"));
            expect(button).toBeTruthy();

            expect(button.nativeElement.textContent).toEqual("Use Password");
        });

        it("should hide the switch strategy button if keys are not detected", () => {
            pubKeySubject.next(null);
            fixture.detectChanges();

            const button = de.query(By.css(".switch-strategy"));
            expect(button).toBeFalsy();
        });

        it("should not display a password input", () => {
            const input = de.query(By.css("#password-input"));
            expect(input).toBeFalsy();
        });
    });

    describe("when pool is iaas windows", () => {
        beforeEach(() => {
            testComponent.connectionSettings = {
                ip: "0.0.0.0",
                port: 50000,
                type: ConnectionType.RDP,
            } as NodeConnectionSettings;
            testComponent.usingSSHKeys = false;
            fixture.detectChanges();
        });

        it("should download the rdp file", (done) => {
            component.downloadRdp().subscribe(() => {
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledOnce();
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledWith(
                    component.connectionSettings,
                    component.credentials,
                    component.node.id,
                );

                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledOnce();
                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledWith("path/to/file");
                done();
            });
        });

        it("should display a password input", () => {
            const input = de.query(By.css("#password-input"));
            expect(input).toBeTruthy();
        });
    });

    describe("when pool is paas windows", () => {
        beforeEach(() => {
            testComponent.connectionSettings = {
                ip: "0.0.0.0",
                port: null,
                type: ConnectionType.RDP,
            } as NodeConnectionSettings;
            testComponent.usingSSHKeys = false;
            fixture.detectChanges();
        });

        it("should download the rdp file", (done) => {
            component.downloadRdp().subscribe(() => {
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledOnce();
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledWith(
                    component.connectionSettings,
                    component.credentials,
                    component.node.id,
                );

                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledOnce();
                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledWith("path/to/file");
                done();
            });
        });

        it("should display a password input", () => {
            const input = de.query(By.css("#password-input"));
            expect(input).toBeTruthy();
        });
    });
});
