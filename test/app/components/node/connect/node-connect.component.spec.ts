import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { ButtonComponent } from "app/components/base/buttons";
import { PropertyGroupComponent, TextPropertyComponent } from "app/components/base/property-list";
import { SidebarRef } from "app/components/base/sidebar";
import { NodeConnectComponent } from "app/components/node/connect";
import { NodeAgentSku } from "app/models";
import { AuthorizationHttpService, ElectronShell, FileSystemService, NodeService, NodeUserService } from "app/services";
import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";

@Component({
    template: `<bl-node-connect></bl-node-connect>`,
})
class TestComponent {
}

describe("NodeConnectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: NodeConnectComponent;
    let de: DebugElement;

    let nodeServiceSpy;
    let nodeUserServiceSpy;

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
                { provide: AuthorizationHttpService, useValue: null },
                { provide: ElectronShell, useValue: null },
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

    it("should propose to generate or specify credentials", () => {
        const buttons = de.queryAll(By.css(".credentials-source bl-button"));
        expect(buttons.length).toBe(2);
        expect(buttons[0].nativeElement.textContent).toContain("Generate");
        expect(buttons[1].nativeElement.textContent).toContain("Specify");
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
});
