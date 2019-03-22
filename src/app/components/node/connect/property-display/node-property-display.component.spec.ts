import { ChangeDetectorRef, Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { UserConfigurationService } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ClipboardService, ElectronShell } from "@batch-flask/electron";
import { DialogService, DurationPickerModule } from "@batch-flask/ui";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { PropertyGroupComponent, TextPropertyComponent } from "@batch-flask/ui/property-list";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { ConnectionType, Node, NodeConnectionSettings } from "app/models";
import { SSHKeyService } from "app/services";
import {
    NodeConnectService,
} from "app/services/node-connect";
import { Duration } from "luxon";
import { BehaviorSubject, of } from "rxjs";
import * as Fixtures from "test/fixture";
import { NodePropertyDisplayComponent } from ".";
import { UserConfiguration } from "./node-property-display.component";

@Component({
    template: `<bl-node-property-display
        [connectionSettings]="connectionSettings"
        [node]="node"
        [publicKeyFile]="publicKeyFile"
        [(usingSSHKeys)]="usingSSHKeys"
        [userConfig]="userConfig"
        (userConfigChange)="updateCredentials($event)"
    ></bl-node-property-display>`,
})
class TestComponent {
    public connectionSettings: NodeConnectionSettings;
    public node: Node;
    public publicKeyFile: string;
    public userConfig: UserConfiguration;
}

describe("NodePropertyDisplay", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: NodePropertyDisplayComponent;
    let de: DebugElement;

    let electronShellSpy;
    let nodeConnectServiceSpy;
    let settingsServiceSpy;
    let sshKeyServiceSpy;
    let dialogServiceSpy;
    let pubKeySubject: BehaviorSubject<string>;

    beforeEach(async () => {
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

        sshKeyServiceSpy = {
            homePublicKeyPath: "~/.ssh/id_rsa.pub",
        };

        dialogServiceSpy = {
            open: jasmine.createSpy("openDialog").and.returnValue({ afterClose: () => of("rsa picked-key") }),
        };

        TestBed.configureTestingModule({
            imports: [
                DurationPickerModule,
                MatCheckboxModule,
                ButtonsModule,
                I18nTestingModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            declarations: [
                NodePropertyDisplayComponent, TextPropertyComponent,
                PropertyGroupComponent, TestComponent,
            ],
            providers: [
                { provide: SidebarRef, useValue: null },
                { provide: ElectronShell, useValue: electronShellSpy },
                { provide: NodeConnectService, useValue: nodeConnectServiceSpy },
                { provide: SSHKeyService, useValue: sshKeyServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
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
        testComponent.userConfig = {
            name: "foo",
            password: "bar",
            sshPublicKey: "baz",
            usingSSHKey: true,
            isAdmin: true,
            expireIn: Duration.fromObject({ days: 2 }),
        };
        testComponent.connectionSettings = {
            ip: "0.0.0.0",
            port: 50000,
            type: ConnectionType.SSH,
        } as NodeConnectionSettings;
        testComponent.node = Fixtures.node.create();
        testComponent.publicKeyFile = "beep";
        fixture.detectChanges();

        await fixture.whenStable();
        fixture.detectChanges();
    });

    describe("when pool is iaas linux", () => {
        beforeEach(() => {
            testComponent.connectionSettings = {
                ip: "0.0.0.0",
                port: 50000,
                type: ConnectionType.SSH,
            } as NodeConnectionSettings;
            testComponent.userConfig.usingSSHKey = true;
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
            testComponent.userConfig.usingSSHKey = false;
            fixture.detectChanges();
        });

        it("should download the rdp file", (done) => {
            component.downloadRdp().subscribe(() => {
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledOnce();
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledWith(
                    component.connectionSettings,
                    component.userConfig,
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
            testComponent.userConfig.usingSSHKey = false;
            fixture.detectChanges();
        });

        it("should download the rdp file", (done) => {
            component.downloadRdp().subscribe(() => {
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledOnce();
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledWith(
                    component.connectionSettings,
                    component.userConfig,
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

    it("should display the exiry time picker", async () => {
        const durationPickerEl = de.query(By.css(".expire-in bl-duration-picker"));
        expect(durationPickerEl).toBeTruthy();
        expect(durationPickerEl.componentInstance.value.toISO()).toBe("P2D");
    });

    it("should display the isAdmin checkbox", async () => {
        const checkboxEl = de.query(By.css(".isAdmin mat-checkbox"));
        expect(checkboxEl).toBeTruthy();
        expect(checkboxEl.componentInstance.checked).toBe(true);
    });
});
