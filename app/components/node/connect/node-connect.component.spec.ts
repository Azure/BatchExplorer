import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ClipboardService, ElectronShell } from "@batch-flask/ui";
import { Observable } from "rxjs";

import { ButtonComponent } from "@batch-flask/ui/buttons";
import { PermissionService } from "@batch-flask/ui/permission";
import { PropertyGroupComponent, TextPropertyComponent } from "@batch-flask/ui/property-list";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { NodeConnectComponent } from "app/components/node/connect";
import { NodeAgentSku } from "app/models";
import { BatchLabsService, FileSystemService, NodeService, NodeUserService, SSHKeyService, SettingsService } from "app/services";
import { PoolUtils } from "app/utils";
import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";

@Component({
    template: `<bl-node-connect></bl-node-connect>`,
})
class TestComponent {
}

fdescribe("NodeConnectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: NodeConnectComponent;
    let de: DebugElement;

    let nodeServiceSpy;
    let nodeUserServiceSpy;
    let settingsServiceSpy;
    let batchLabsServiceSpy;
    let sshKeyServiceSpy;
    let poolUtilsSpy;

    beforeEach(() => {

        nodeServiceSpy = {
            getRemoteDesktop: jasmine.createSpy("").and.returnValue(Observable.of({ content: "banana" })),
            listNodeAgentSkus: jasmine.createSpy("").and.returnValue(new MockListView(NodeAgentSku, {
                items: [],
            })),
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
            getLocalPublicKey: jasmine.createSpy("").and.returnValue(Observable.of("ssh-rsa foobar")),
        };

        poolUtilsSpy = {
            isWindows: jasmine.createSpy("").and.returnValue(false),
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
                { provide: PoolUtils, useValue: poolUtilsSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-node-connect"));
        component = de.componentInstance;
        component.pool = Fixtures.pool.create();
        component.node = Fixtures.node.create();
        fixture.detectChanges();
    });

    it("should propose to generate or specify credentials, or connect in one click", () => {
        const buttons = de.queryAll(By.css(".credentials-source bl-button"));
        expect(buttons.length).toBe(3);
        expect(buttons[0].nativeElement.textContent).toContain("Generate");
        expect(buttons[1].nativeElement.textContent).toContain("Specify");
        expect(buttons[2].nativeElement.textContent).toContain("QuickStart");
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

    it("clicking on quickstart should launch a new process", () => {
        const button = de.queryAll(By.css("bl-button"))[2].componentInstance;
        button.action().subscribe(() => {
            fixture.detectChanges();
            expect(component.credentials).not.toBeFalsy("Credentials should be defined");
            expect(component.credentials.name).not.toBeFalsy();
            expect(component.credentials.sshPublicKey).not.toBeFalsy();
            expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();
            expect(batchLabsServiceSpy.launchApplication).toHaveBeenCalledOnce();
        });
    });
});
