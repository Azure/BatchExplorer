import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ClipboardService, ElectronShell } from "@batch-flask/ui";
import { BehaviorSubject, Observable } from "rxjs";

import { ButtonComponent } from "@batch-flask/ui/buttons";
import { PermissionService } from "@batch-flask/ui/permission";
import { PropertyGroupComponent, TextPropertyComponent } from "@batch-flask/ui/property-list";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { NodeConnectComponent } from "app/components/node/connect";
import { Node, NodeConnectionSettings, Pool } from "app/models";
import {
    BatchLabsService,
    FileSystemService,
    NodeService,
    NodeUserService,
    PoolOsService,
    SSHKeyService,
    SettingsService,
} from "app/services";
import { List } from "immutable";
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

    let nodeServiceSpy;
    let nodeUserServiceSpy;
    let settingsServiceSpy;
    let batchLabsServiceSpy;
    let sshKeyServiceSpy;
    let poolOsServiceSpy;

    beforeEach(() => {

        nodeServiceSpy = {
            getRemoteDesktop: jasmine.createSpy("").and.returnValue(Observable.of({ content: "banana" })),
            getRemoteLoginSettings: jasmine.createSpy("").and.returnValue(Observable.of(
                new NodeConnectionSettings({remoteLoginIPAddress: "123.345.654.399", remoteLoginPort: 22})),
            ),
        };

        nodeUserServiceSpy = {
            addOrUpdateUser: jasmine.createSpy("").and.returnValue(Observable.of(true)),
        };

        settingsServiceSpy = {
            settings: {
                username: "foo",
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

        poolOsServiceSpy = {
            nodeAgentSkus: new BehaviorSubject(List([])),
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
                { provide: NodeUserService, useValue: nodeUserServiceSpy },
                { provide: FileSystemService, useValue: null },
                { provide: PermissionService, useValue: null },
                { provide: ElectronShell, useValue: null },
                { provide: SettingsService, useValue: settingsServiceSpy },
                { provide: BatchLabsService, useValue: batchLabsServiceSpy },
                { provide: SSHKeyService, useValue: sshKeyServiceSpy },
                { provide: ClipboardService, useValue: {} },
                { provide: PoolOsService, useValue: poolOsServiceSpy },
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

    it("should propose to generate or specify credentials, or connect in one click", () => {
        const buttons = de.queryAll(By.css(".credentials-source bl-button"));
        expect(buttons.length).toBe(3);
        expect(buttons[0].nativeElement.textContent).toContain("Generate");
        expect(buttons[1].nativeElement.textContent).toContain("Specify");
        expect(buttons[2].nativeElement.textContent).toContain("Quick Connect");
    });

    it("should not show more info", () => {
        expect(de.query(By.css("bl-property-group"))).toBeFalsy();
        expect(de.query(By.css("bl-node-user-credentials-form"))).toBeFalsy();
    });

    it("clicking on generate should generate credentials", (done) => {
        const button = de.queryAll(By.css("bl-button"))[0].componentInstance;
        button.action().subscribe(() => {
            fixture.detectChanges();
            expect(component.credentials).not.toBeFalsy("Credentials should be defined");
            expect(component.credentials.name).not.toBeFalsy();
            expect(component.credentials.password).not.toBeFalsy();
            expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();

            const properties = de.query(By.css("bl-property-group"));
            expect(properties).not.toBeFalsy();
            expect(properties.nativeElement.textContent).toContain(component.credentials.name);
            expect(properties.nativeElement.textContent).toContain(component.credentials.password);

            expect(de.query(By.css("bl-download-rdp"))).not.toBeFalsy();
            done();
        });
    });

    describe("clicking on specify", () => {
        beforeEach(() => {
            const button = de.queryAll(By.css("bl-button"))[1].componentInstance;
            button.action();
            fixture.detectChanges();
        });

        it("should show the form", () => {
            expect(de.query(By.css("bl-node-user-credentials-form"))).not.toBeFalsy();
        });

        it("should add the user when form is submitted", () => {
            component.addOrUpdateUser({ name: "foo", password: "bar", isAdmin: false }).subscribe(() => null);
            fixture.detectChanges();
            const properties = de.query(By.css("bl-property-group"));

            expect(component.credentials).not.toBeFalsy();
            expect(component.credentials.name).toEqual("foo");
            expect(component.credentials.password).toEqual("bar");

            expect(properties).not.toBeFalsy();
            expect(properties.nativeElement.textContent).toContain("foo");
            expect(properties.nativeElement.textContent).not.toContain("bar");
            expect(de.query(By.css("bl-download-rdp"))).not.toBeFalsy();
        });
    });

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

        it("clicking on quickstart should call launchApplication", (done) => {
            const button = de.queryAll(By.css("bl-button"))[2].componentInstance;
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

        it("should disable the quickstart button if no ssh key is found", () => {
            component.hasLocalPublicKey = false;
            fixture.detectChanges();

            const button = de.queryAll(By.css("bl-button"))[2].componentInstance;
            expect(button.disabled).toBeTruthy();
        });
    });
});
