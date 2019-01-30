import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { UserConfigurationService } from "@batch-flask/core";
import { MockUserConfigurationService } from "@batch-flask/core/testing";
import { ClipboardService, ElectronShell, FileSystemService } from "@batch-flask/electron";
import { ButtonComponent } from "@batch-flask/ui/buttons";
import { PermissionService } from "@batch-flask/ui/permission";
import { PropertyGroupComponent, TextPropertyComponent } from "@batch-flask/ui/property-list";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { SecureUtils } from "@batch-flask/utils";
import { NodeConnectComponent } from "app/components/node/connect";
import { ConnectionType, Node, Pool } from "app/models";
import {
    AddNodeUserAttributes,
    BatchExplorerService,
    NodeConnectService,
    NodeUserService,
} from "app/services";
import { PoolUtils } from "app/utils";
import { of } from "rxjs";
import * as Fixtures from "test/fixture";

@Component({
    template: `<bl-node-connect [pool]="pool" [node]="node"></bl-node-connect>`,
})
class TestComponent {
    public pool: Pool;
    public node: Node;
}

describe("NodeConnectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: NodeConnectComponent;
    let de: DebugElement;

    let nodeUserServiceSpy;
    let settingsServiceSpy: MockUserConfigurationService;
    let batchExplorerServiceSpy;
    let fsServiceSpy;
    let electronShellSpy;
    let secureUtilsSpy;
    let nodeConnectServiceSpy;
    let clipboardServiceSpy;

    beforeEach(() => {
        nodeUserServiceSpy = {
            addOrUpdateUser: jasmine.createSpy("").and.returnValue(of(true)),
        };

        settingsServiceSpy = new MockUserConfigurationService({
            nodeConnect: {defaultUsername: "foo"},
        });

        batchExplorerServiceSpy = {
            launchApplication: jasmine.createSpy("").and.returnValue(
                new Promise((resolve, reject) => {
                    resolve({ name: "banana" });
                }),
            ),
        };

        fsServiceSpy = {
            commonFolders: {
                home: "home",
                temp: "temp",
                downloads: "downloads",
            },
            saveFile: jasmine.createSpy("").and.returnValue(Promise.resolve("path/to/file")),
        };

        electronShellSpy = {
            openItem: jasmine.createSpy("").and.returnValue(true),
            showItemInFolder: jasmine.createSpy("").and.returnValue(true),
        };

        secureUtilsSpy = {
            generateWindowsPassword: jasmine.createSpy("").and.returnValue("beep"),
        };

        nodeConnectServiceSpy = {
            getPublicKey: jasmine.createSpy("").and.returnValue(of("baz")),
            saveRdpFile: jasmine.createSpy("").and.returnValue(of("path/to/file")),
            getConnectionSettings: jasmine.createSpy("").and.callFake((pool, node) => {
                if (PoolUtils.isPaas(pool)) {
                    return of("full address:s:0.0.0.0");
                } else {
                    return of({
                        ip: "0.0.0.0",
                        port: 50000,
                        type: PoolUtils.isLinux ? ConnectionType.SSH : ConnectionType.RDP,
                    });
                }
            }),
        };

        clipboardServiceSpy = {
            writeText: jasmine.createSpy("writeText"),
        };

        TestBed.configureTestingModule({
            declarations: [
                NodeConnectComponent, ButtonComponent,
                TextPropertyComponent, PropertyGroupComponent, TestComponent,
            ],
            providers: [
                { provide: SidebarRef, useValue: null },
                { provide: NodeUserService, useValue: nodeUserServiceSpy },
                { provide: FileSystemService, useValue: fsServiceSpy },
                { provide: PermissionService, useValue: null },
                { provide: UserConfigurationService, useValue: settingsServiceSpy },
                { provide: BatchExplorerService, useValue: batchExplorerServiceSpy },
                { provide: ClipboardService, useValue: {} },
                { provide: ElectronShell, useValue: electronShellSpy },
                { provide: SecureUtils, useValue: secureUtilsSpy },
                { provide: NodeConnectService, useValue: nodeConnectServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-node-connect"));
        component = de.componentInstance;
        testComponent.pool = Fixtures.pool.create();
        testComponent.node = Fixtures.node.create();
        fixture.detectChanges();
    });

    it("should propose to connect or configure credentials", () => {
        const buttons = de.queryAll(By.css(".credentials-source bl-button"));
        expect(buttons.length).toBe(2);
        expect(buttons[0].nativeElement.textContent).toContain("Connect");
        expect(buttons[1].nativeElement.textContent).toContain("Configure");
    });

    it("should not show the node user credentials form", () => {
        expect(de.query(By.css("bl-node-user-credentials-form"))).toBeFalsy();
    });

    describe("clicking on connect", () => {
        describe("when pool is iaas linux", () => {
            beforeEach(() => {
                testComponent.pool = new Pool({
                    id: "iaas-linux-pool",
                    virtualMachineConfiguration: {
                        nodeAgentSKUId: "batch.node.ubuntu 14.04",
                        imageReference: {
                            publisher: "Canonical",
                            offer: "UbuntuServer",
                            sku: "14.04.5-LTS",
                        },
                    },
                } as any);
                fixture.detectChanges();

                component.ngOnInit();
            });

            it("clicking on connect should call launchApplication", (done) => {
                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                button.action().subscribe(() => {
                    fixture.detectChanges();
                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("iaas-linux-pool");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ sshPublicKey: "baz" }));

                    // validate calls to launchApplication
                    expect(batchExplorerServiceSpy.launchApplication).toHaveBeenCalledOnce();
                    const launchApplicationArgs = batchExplorerServiceSpy.launchApplication.calls.mostRecent().args;
                    expect(launchApplicationArgs.length).toBe(2);
                    expect(Object.keys(launchApplicationArgs[1])).toContain("command");
                    expect(launchApplicationArgs[1].command).toContain("ssh");
                    expect(launchApplicationArgs[1].command).toContain("foo");
                    done();
                });
            });
        });

        describe("when pool is iaas windows", () => {
            beforeEach(() => {
                testComponent.pool = new Pool({
                    id: "insights-windows",
                    virtualMachineConfiguration: {
                        nodeAgentSKUId: "batch.node.windows amd64",
                        imageReference: {
                            publisher: "MicrosoftWindowsServer",
                            offer: "WindowsServer",
                            sku: "2016-Datacenter",
                            version: "latest",
                        },
                    },
                } as any);
                fixture.detectChanges();
            });

            it("clicking on connect should open the rdp file", (done) => {
                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                button.action().subscribe(() => {
                    fixture.detectChanges();

                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("insights-windows");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2].password).toBeTruthy();

                    expect(nodeConnectServiceSpy.saveFile);

                    // validate calls to shell.openItem
                    expect(electronShellSpy.openItem).toHaveBeenCalledOnce();
                    const openItemArgs = electronShellSpy.openItem.calls.mostRecent().args;
                    expect(openItemArgs.length).toBe(1);
                    expect(openItemArgs[0]).toContain("path/to/file");

                    expect(clipboardServiceSpy.writeText).toHaveBeenCalledWith(updateUserArgs[2].password);

                    done();
                });
            });
        });

        describe("when pool is paas windows", () => {
            beforeEach(() => {
                testComponent.pool = new Pool({
                    id: "a",
                    cloudServiceConfiguration: {
                        osVersion: "*",
                        osFamily: "4",
                    },
                } as any);
                fixture.detectChanges();
            });

            it("clicking on connect should open the rdp file", (done) => {
                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                button.action().subscribe(() => {
                    fixture.detectChanges();

                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("a");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2].password).toBeTruthy();

                    // validate calls to shell.openItem
                    expect(electronShellSpy.openItem).toHaveBeenCalledOnce();
                    const openItemArgs = electronShellSpy.openItem.calls.mostRecent().args;
                    expect(openItemArgs.length).toBe(1);
                    expect(openItemArgs[0]).toContain("path/to/file");

                    done();
                });
            });
        });
    });

    describe("clicking on configure", () => {
        beforeEach(() => {
            const button = de.queryAll(By.css("bl-button"))[1].componentInstance;
            button.action();
            fixture.detectChanges();
        });

        it("should show the form", () => {
            expect(component.formVisible).toBeTruthy();
        });

        it("should change service variables when the form is submitted", () => {
            const now = new Date();

            const formCredentials: AddNodeUserAttributes = {
                name: "foo",
                password: "bar",
                isAdmin: false,
                expiryTime: now,
            };
            component.storeCredentialsFromForm(formCredentials);
            fixture.detectChanges();

            expect(component.credentials).toEqual(formCredentials);
        });
    });
});
