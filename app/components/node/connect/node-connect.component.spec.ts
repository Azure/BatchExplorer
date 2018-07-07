import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ClipboardService, ElectronShell } from "@batch-flask/ui";
import { clipboard } from "electron";
import * as path from "path";
import { Observable } from "rxjs";

import { ButtonComponent } from "@batch-flask/ui/buttons";
import { PermissionService } from "@batch-flask/ui/permission";
import { PropertyGroupComponent, TextPropertyComponent } from "@batch-flask/ui/property-list";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { NodeConnectComponent } from "app/components/node/connect";
import { Node, NodeAgentSku, NodeConnectionSettings, Pool } from "app/models";
import {
    AddNodeUserAttributes,
    BatchLabsService,
    FileSystemService,
    NodeService,
    NodeUserService,
    SSHKeyService,
    SettingsService,
} from "app/services";
import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";

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

    let nodeServiceSpy;
    let nodeUserServiceSpy;
    let settingsServiceSpy;
    let batchLabsServiceSpy;
    let sshKeyServiceSpy;
    let fsServiceSpy;
    let electronShellSpy;

    beforeEach(() => {

        nodeServiceSpy = {
            getRemoteDesktop: jasmine.createSpy("").and.returnValue(Observable.of({ content: "banana" })),
            listNodeAgentSkus: jasmine.createSpy("").and.returnValue(new MockListView(NodeAgentSku, {
                items: [],
            })),
            getRemoteLoginSettings: jasmine.createSpy("").and.returnValue(Observable.of(
                new NodeConnectionSettings({remoteLoginIPAddress: "123.345.654.399", remoteLoginPort: 22})),
            ),
        };

        nodeUserServiceSpy = {
            addOrUpdateUser: jasmine.createSpy("").and.returnValue(Observable.of(true)),
        };

        settingsServiceSpy = {
            settings: {
                "node-connect.default-username": "foo",
            },
        };

        batchLabsServiceSpy = {
            launchApplication: jasmine.createSpy("").and.returnValue(
                new Promise((resolve, reject) => {
                    resolve({ name: "banana" });
                }),
            ),
        };

        sshKeyServiceSpy = {
            hasLocalPublicKey: jasmine.createSpy("").and.returnValue(Observable.of(true)),
            getLocalPublicKey: jasmine.createSpy("").and.returnValue(Observable.of("bar")),
        };

        fsServiceSpy = {
            commonFolders: {
                home: "home",
                temp: "temp",
                downloads: "downloads",
            },
            saveFile: jasmine.createSpy("").and.returnValue(
                new Promise((resolve, reject) => {
                    resolve("path/to/file");
                }),
            ),
        };

        electronShellSpy = {
            openItem: jasmine.createSpy("").and.returnValue(true),
            showItemInFolder: jasmine.createSpy("").and.returnValue(true),
        };

        TestBed.configureTestingModule({
            declarations: [
                NodeConnectComponent, ButtonComponent,
                TextPropertyComponent, PropertyGroupComponent, TestComponent,
            ],
            providers: [
                { provide: SidebarRef, useValue: null },
                { provide: NodeService, useValue: nodeServiceSpy },
                { provide: NodeUserService, useValue: nodeUserServiceSpy },
                { provide: FileSystemService, useValue: fsServiceSpy },
                { provide: PermissionService, useValue: null },
                { provide: SettingsService, useValue: settingsServiceSpy },
                { provide: BatchLabsService, useValue: batchLabsServiceSpy },
                { provide: SSHKeyService, useValue: sshKeyServiceSpy },
                { provide: ClipboardService, useValue: {} },
                { provide: ElectronShell, useValue: electronShellSpy },
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
            });

            it("clicking on connect should call launchApplication", (done) => {
                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                button.action().subscribe(() => {
                    fixture.detectChanges();
                    expect(component.credentials).not.toBeFalsy("Credentials should be defined");
                    expect(component.credentials.name).not.toBeFalsy();
                    expect(component.credentials.sshPublicKey).not.toBeFalsy();

                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("iaas-linux-pool");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ sshPublicKey: "bar" }));

                    // validate calls to launchApplication
                    expect(batchLabsServiceSpy.launchApplication).toHaveBeenCalledOnce();
                    const launchApplicationArgs = batchLabsServiceSpy.launchApplication.calls.mostRecent().args;
                    expect(launchApplicationArgs.length).toBe(2);
                    expect(Object.keys(launchApplicationArgs[1])).toContain("command");
                    expect(launchApplicationArgs[1].command).toContain("ssh");
                    expect(launchApplicationArgs[1].command).toContain("foo");
                    done();
                });
            });

            it("should disable the connect button if no ssh key is found", () => {
                component.hasLocalPublicKey = false;
                fixture.detectChanges();

                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                expect(button.disabled).toBeTruthy();
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
                    expect(component.credentials).not.toBeFalsy("Credentials should be defined");
                    expect(component.credentials.name).not.toBeFalsy();
                    expect(component.credentials.password).not.toBeFalsy();

                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("insights-windows");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({
                        password: component.credentials.password,
                    }));

                    // validate calls to shell.openItem
                    expect(electronShellSpy.openItem).toHaveBeenCalledOnce();
                    const openItemArgs = electronShellSpy.openItem.calls.mostRecent().args;
                    expect(openItemArgs.length).toBe(1);
                    expect(openItemArgs[0]).toContain("path/to/file");

                    // ensure the password was copied to clipboard
                    expect(clipboard.readText()).toEqual(component.credentials.password);

                    done();
                });
            });

            it("should use a provided password if a user entered one", (done) => {
                const password = "mypassword";
                component.password = password;

                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                button.action().subscribe(() => {
                    fixture.detectChanges();
                    expect(component.credentials).not.toBeFalsy("Credentials should be defined");
                    expect(component.credentials.name).not.toBeFalsy();
                    expect(component.credentials.password).not.toBeFalsy();

                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("insights-windows");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({
                        password: password,
                    }));

                    // validate calls to shell.openItem
                    expect(electronShellSpy.openItem).toHaveBeenCalledOnce();
                    const openItemArgs = electronShellSpy.openItem.calls.mostRecent().args;
                    expect(openItemArgs.length).toBe(1);
                    expect(openItemArgs[0]).toContain("path/to/file");

                    // ensure the password was copied to clipboard
                    expect(clipboard.readText()).toEqual(password);

                    done();
                });
            });

            it("should download the rdp file", () => {
                // TODO-Adam this test doesn't appear to actually be running
                const expectedContent = "full address:s:0.0.0.0\nusername:s:.\\bar\nprompt for credentials:i:1";

                component.downloadRdp().subscribe(() => {
                    expect(fsServiceSpy.saveFile).toHaveBeenCalledOnce();
                    const saveFileArgs = fsServiceSpy.showItemInFolder.calls.mostRecent().args;
                    expect(saveFileArgs.length).toBe(2);
                    expect(saveFileArgs[0]).toEqual(path.join(fsServiceSpy.commonFolders.temp, "rdp"));
                    expect(saveFileArgs[1]).toEqual(expectedContent);

                    expect(electronShellSpy.showItemInFolder).toHaveBeenCalledOnce();
                    const showItemInFolderArgs = electronShellSpy.showItemInFolder.calls.mostRecent().args;
                    expect(showItemInFolderArgs.length).toBe(1);
                    expect(showItemInFolderArgs[0]).toContain("path/to/file");
                });
            });
        });

        describe("when pool is paas windows", () => {
            beforeEach(() => {
                testComponent.pool = new Pool({
                    id: "a",
                    cloudServiceConfiguration: {
                        currentOSVersion: "*",
                        osFamily: "4",
                        targetOSVersion: "*",
                    },
                } as any);
                fixture.detectChanges();
            });

            it("clicking on connect should open the rdp file", (done) => {
                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                button.action().subscribe(() => {
                    fixture.detectChanges();
                    expect(component.credentials).not.toBeFalsy("Credentials should be defined");
                    expect(component.credentials.name).not.toBeFalsy();
                    expect(component.credentials.password).not.toBeFalsy();

                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("a");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({
                        password: component.credentials.password,
                    }));

                    // validate calls to shell.openItem
                    expect(electronShellSpy.openItem).toHaveBeenCalledOnce();
                    const openItemArgs = electronShellSpy.openItem.calls.mostRecent().args;
                    expect(openItemArgs.length).toBe(1);
                    expect(openItemArgs[0]).toContain("path/to/file");

                    // ensure the password was copied to clipboard
                    expect(clipboard.readText()).toEqual(component.credentials.password);

                    done();
                });
            });

            it("should use a provided password if a user entered one", (done) => {
                const password = "mypassword";
                component.password = password;

                const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
                button.action().subscribe(() => {
                    fixture.detectChanges();
                    expect(component.credentials).not.toBeFalsy("Credentials should be defined");
                    expect(component.credentials.name).not.toBeFalsy();
                    expect(component.credentials.password).not.toBeFalsy();

                    // validate calls to addOrUpdateUser
                    expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
                    const updateUserArgs = nodeUserServiceSpy.addOrUpdateUser.calls.mostRecent().args;
                    expect(updateUserArgs.length).toBe(3);
                    expect(updateUserArgs[0]).toBe("a");
                    expect(updateUserArgs[1]).toBe("node-1");
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({ name: "foo" }));
                    expect(updateUserArgs[2]).toEqual(jasmine.objectContaining({
                        password: password,
                    }));

                    // validate calls to shell.openItem
                    expect(electronShellSpy.openItem).toHaveBeenCalledOnce();
                    const openItemArgs = electronShellSpy.openItem.calls.mostRecent().args;
                    expect(openItemArgs.length).toBe(1);
                    expect(openItemArgs[0]).toContain("path/to/file");

                    // ensure the password was copied to clipboard
                    expect(clipboard.readText()).toEqual(password);

                    done();
                });
            });

            it("should download the rdp file", () => {
                component.downloadRdp().subscribe(() => {
                    expect(electronShellSpy.showItemInFolder).toHaveBeenCalledOnce();
                    const showItemInFolderArgs = electronShellSpy.showItemInFolder.calls.mostRecent().args;
                    expect(showItemInFolderArgs.length).toBe(1);
                    expect(showItemInFolderArgs[0]).toContain("path/to/file");
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
            expect(de.query(By.css("bl-node-user-credentials-form"))).not.toBeFalsy();
        });

        it("should only affect component variables when the form is submitted", () => {
            const now = new Date();

            const formCredentials: AddNodeUserAttributes = {
                name: "foo",
                password: "bar",
                isAdmin: false,
                expiryTime: now,
            };
            component.storeCredentialsFromForm(formCredentials);
            fixture.detectChanges();

            expect(component.username).toEqual("foo");
            expect(component.password).toEqual("bar");
            expect(component.isAdmin).toBeFalsy();
            expect(component.expiryTime).toEqual(now);
        });
    });
});
