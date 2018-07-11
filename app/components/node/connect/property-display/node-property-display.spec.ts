import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ClipboardService, ElectronShell } from "@batch-flask/ui";
import { Observable } from "rxjs";

import { ButtonComponent } from "@batch-flask/ui/buttons";
import { PropertyGroupComponent, TextPropertyComponent } from "@batch-flask/ui/property-list";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { Node } from "app/models";
import {
    NodeConnectService,
} from "app/services";
import * as Fixtures from "test/fixture";
import { NodePropertyDisplayComponent } from ".";

@Component({
    template: `<bl-node-property-display
        [connectionSettings]="connectionSettings"
        [rdpContent]="rdpContent"
        [node]="node"
        [linux]="linux"
    ></bl-node-property-display>`,
})
class TestComponent {
    public connectionSettings: any;
    public rdpContent: string;
    public node: Node;
    public linux: boolean;
}

describe("NodePropertyDisplay", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: NodePropertyDisplayComponent;
    let de: DebugElement;

    let electronShellSpy;
    let nodeConnectServiceSpy;

    beforeEach(() => {
        electronShellSpy = {
            openItem: jasmine.createSpy("").and.returnValue(true),
            showItemInFolder: jasmine.createSpy("").and.returnValue(true),
        };

        nodeConnectServiceSpy = {
            username: "foo",
            password: "bar",
            publicKey: Observable.of("baz"),
            saveRdpFile: jasmine.createSpy("").and.returnValue(Observable.of("path/to/file")),
        };

        TestBed.configureTestingModule({
            declarations: [
                NodePropertyDisplayComponent, ButtonComponent,
                TextPropertyComponent, PropertyGroupComponent, TestComponent,
            ],
            providers: [
                { provide: SidebarRef, useValue: null },
                { provide: ElectronShell, useValue: electronShellSpy },
                { provide: NodeConnectService, useValue: nodeConnectServiceSpy },
                { provide: ClipboardService, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-node-property-display"));
        component = de.componentInstance;
        testComponent.connectionSettings = {
            ip: "0.0.0.0",
            port: "50000",
        };
        testComponent.node = Fixtures.node.create();
        testComponent.rdpContent = "full address:s:0.0.0.0\nusername:s:.\\foo\nprompt for credentials:i:1";
        testComponent.linux = true;
        fixture.detectChanges();
    });

    describe("when pool is iaas linux", () => {
        beforeEach(() => {
            testComponent.linux = true;
            fixture.detectChanges();
        });

        it("should display ssh info", () => {
            const display = de.query(By.css("#ssh-command")).componentInstance;
            expect(display.value).toEqual("ssh foo@0.0.0.0 -p 50000");
        });
    });

    describe("when pool is iaas windows", () => {
        beforeEach(() => {
            testComponent.linux = false;
            fixture.detectChanges();
        });

        it("should download the rdp file", (done) => {
            component.downloadRdp().subscribe(() => {
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledOnce();
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledWith(
                    component.rdpContent,
                    component.connectionSettings,
                    component.node.id,
                );

                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledOnce();
                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledWith("path/to/file");
                done();
            });
        });
    });

    describe("when pool is paas windows", () => {
        beforeEach(() => {
            testComponent.linux = false;
            fixture.detectChanges();
        });

        it("should download the rdp file", (done) => {
            component.downloadRdp().subscribe(() => {
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledOnce();
                expect(nodeConnectServiceSpy.saveRdpFile).toHaveBeenCalledWith(
                    component.rdpContent,
                    component.connectionSettings,
                    component.node.id,
                );

                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledOnce();
                expect(electronShellSpy.showItemInFolder).toHaveBeenCalledWith("path/to/file");
                done();
            });
        });
    });
});
