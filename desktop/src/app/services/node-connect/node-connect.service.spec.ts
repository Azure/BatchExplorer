import { TestBed } from "@angular/core/testing";
import { UserConfigurationService } from "@batch-flask/core";
import { MockUserConfigurationService } from "@batch-flask/core/testing";
import { FileSystemService } from "@batch-flask/electron";
import { OS, Platform } from "@batch-flask/utils";
import { ConnectionType, IaasNodeConnectionSettings, NodeConnectionSettings, Pool } from "app/models";
import * as path from "path";
import { of } from "rxjs";
import { AddNodeUserAttributes, SSHKeyService } from "..";
import { AzureBatchHttpService } from "../azure-batch/core";
import { NodeConnectService } from "./node-connect.service";

describe("NodeConnectService", () => {
    let nodeConnectService: NodeConnectService;

    let settingsServiceSpy: MockUserConfigurationService;
    let fsServiceSpy;
    let sshKeyServiceSpy;
    let httpSpy;
    let connectionSettings: NodeConnectionSettings;
    let credentials: AddNodeUserAttributes;
    let pool;
    let node;

    beforeEach(() => {
        connectionSettings = {
            remoteLoginIPAddress: "0.0.0.0",
            remoteLoginPort: 50000,
            remoteLoginType: ConnectionType.SSH,
        } as NodeConnectionSettings;

        credentials = {
            name: "foo",
            password: "bar",
            sshPublicKey: "baz",
        } as AddNodeUserAttributes;

        node = {
            id: "node-1",
        };

        fsServiceSpy = {
            commonFolders: {
                temp: "temp",
                downloads: "downloads",
            },
            saveFile: jasmine.createSpy("saveFile").and.returnValue(Promise.resolve("path/to/file")),
        };

        sshKeyServiceSpy = {
            getLocalPublicKey: jasmine.createSpy("getLocalPublicKey").and.returnValue(of("baz")),
        };

        settingsServiceSpy = new MockUserConfigurationService({
            nodeConnect: { defaultUsername: "foo" },
        });
        httpSpy = {
            get: jasmine.createSpy("get").and.callFake((str) => {
                const parts = str.split("/");
                if (parts[parts.length - 1] === "rdp") {
                    return of({ body: "full address:s:0.0.0.0" });
                } else {
                    return of({
                        remoteLoginIPAddress: "0.0.0.0",
                        remoteLoginPort: 50000,
                    } as IaasNodeConnectionSettings);
                }
            }),
        };

        TestBed.configureTestingModule({
            providers: [
                NodeConnectService,
                { provide: FileSystemService, useValue: fsServiceSpy },
                { provide: SSHKeyService, useValue: sshKeyServiceSpy },
                { provide: UserConfigurationService, useValue: settingsServiceSpy },
                { provide: AzureBatchHttpService, useValue: httpSpy },
            ],
        });

        nodeConnectService = TestBed.get(NodeConnectService);
    });

    afterEach(() => {
        if (typeof process !== "undefined") {
            OS.platform = process.platform as any;
        } else {
            OS.platform = Platform.Browser;
        }
    });

    describe("#saveRdpFile", () => {
        it("should save the rdp file if local OS is windows", () => {
            OS.platform = Platform.Windows;

            const expectedPath = path.join("temp", "rdp", "node-1.rdp");
            const expectedContent = "full address:s:0.0.0.0:50000\nusername:s:.\\foo\nprompt for credentials:i:1";

            nodeConnectService.saveRdpFile(connectionSettings, credentials, node.id).subscribe((path) => {
                expect(path).toEqual("path/to/file");

                expect(fsServiceSpy.saveFile).toHaveBeenCalledOnce();
                expect(fsServiceSpy.saveFile).toHaveBeenCalledWith(expectedPath);
                expect(fsServiceSpy.saveFile).toHaveBeenCalledWith(expectedContent);
            });
        });

        it("should save the rdp file if local OS is not windows", () => {
            OS.platform = Platform.Linux;

            const expectedPath = path.join("downloads", "node-1.rdp");
            const expectedContent = "full address:s:0.0.0.0:50000\nusername:s:.\\foo\nprompt for credentials:i:1";

            nodeConnectService.saveRdpFile(connectionSettings, credentials, node.id).subscribe((path) => {
                expect(path).toEqual("path/to/file");

                expect(fsServiceSpy.saveFile).toHaveBeenCalledOnce();
                expect(fsServiceSpy.saveFile).toHaveBeenCalledWith(expectedPath);
                expect(fsServiceSpy.saveFile).toHaveBeenCalledWith(expectedContent);
            });
        });
    });

    describe("#getConnectionSettings", () => {
        it("should fetch connection settings from remote IaaS Linux node", () => {
            pool = new Pool({
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

            nodeConnectService.getConnectionSettings(pool, node).subscribe((connectionSettings) => {
                expect(connectionSettings).toEqual(jasmine.objectContaining({ ip: "0.0.0.0" }));
                expect(connectionSettings).toEqual(jasmine.objectContaining({ port: 50000 }));
                expect(connectionSettings).toEqual(jasmine.objectContaining({ type: ConnectionType.SSH }));
            });
        });

        it("should fetch connection settings from remote IaaS Windows node", () => {
            pool = new Pool({
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

            nodeConnectService.getConnectionSettings(pool, node).subscribe((connectionSettings) => {
                expect(connectionSettings).toEqual(jasmine.objectContaining({ ip: "0.0.0.0" }));
                expect(connectionSettings).toEqual(jasmine.objectContaining({ port: 50000 }));
                expect(connectionSettings).toEqual(jasmine.objectContaining({ type: ConnectionType.RDP }));
            });
        });

        it("should fetch connection settings from remote PaaS Windows node", () => {
            pool = new Pool({
                id: "a",
                cloudServiceConfiguration: {
                    osFamily: "4",
                    osVersion: "*",
                },
            } as any);

            nodeConnectService.getConnectionSettings(pool, node).subscribe((connectionSettings) => {
                expect(connectionSettings).toEqual(jasmine.objectContaining({ ip: "0.0.0.0" }));
                expect(connectionSettings).toEqual(jasmine.objectContaining({ port: null }));
                expect(connectionSettings).toEqual(jasmine.objectContaining({ type: ConnectionType.RDP }));
            });
        });
    });
});
