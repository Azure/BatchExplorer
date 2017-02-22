import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { SidebarRef } from "app/components/base/sidebar";
import { NodeConnectComponent, NodeConnectModule } from "app/components/node/connect";
import { NodeAgentSku } from "app/models";
import { AccountService, ElectronShell, FileSystemService, NodeService, NodeUserService } from "app/services";
import * as Fixtures from "test/fixture";
import { RxMockListProxy } from "test/utils/mocks";

@Component({
    template: `<bl-node-connect></bl-node-connect>`,
})
class TestComponent {
}

describe("NodeConnectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: NodeConnectComponent;
    let de: DebugElement;

    let accountServiceSpy;
    let nodeServiceSpy;
    let nodeUserServiceSpy;

    beforeEach(() => {
        accountServiceSpy = {
            listNodeAgentSkus: jasmine.createSpy("").and.returnValue(new RxMockListProxy(NodeAgentSku, {
                items: [],
            })),
        };

        nodeServiceSpy = {
            getRemoteDesktop: jasmine.createSpy("").and.returnValue(Observable.of({ content: "banana" })),
        };

        nodeUserServiceSpy = {
            addOrUpdateUser: jasmine.createSpy("").and.returnValue(Observable.of(true)),
        };

        TestBed.configureTestingModule({
            imports: [NodeConnectModule],
            declarations: [TestComponent],
            providers: [
                { provide: SidebarRef, useValue: null },
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: NodeService, useValue: nodeServiceSpy },
                { provide: NodeUserService, useValue: nodeUserServiceSpy },
                { provide: NodeUserService, useValue: nodeUserServiceSpy },
                { provide: FileSystemService, useValue: null },
                { provide: ElectronShell, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-node-connect"));
        component = de.componentInstance;
        component.pool = Fixtures.pool.create();
        component.node = Fixtures.node.create();
        fixture.detectChanges();
    });

    it("should propose to generate or specify credentials", () => {
        const buttons = de.queryAll(By.css("bl-submit-btn"));
        expect(buttons.length).toBe(2);
        expect(buttons[0].nativeElement.textContent).toContain("Generate");
        expect(buttons[1].nativeElement.textContent).toContain("Specify");
    });

    it("should not show more info", () => {
        expect(de.query(By.css("bl-property-group"))).toBeFalsy();
        expect(de.query(By.css("bl-node-user-credentials-form"))).toBeFalsy();
    });

    it("clicking on generate should generate credentials", (done) => {
        const button = de.queryAll(By.css("bl-submit-btn"))[0].componentInstance;
        button.submit().subscribe(() => {
            fixture.detectChanges();
            expect(component.credentials).not.toBeFalsy();
            expect(component.credentials.username).not.toBeFalsy();
            expect(component.credentials.password).not.toBeFalsy();
            expect(nodeUserServiceSpy.addOrUpdateUser).toHaveBeenCalledOnce();

            const properties = de.query(By.css("bl-property-group"));
            expect(properties).not.toBeFalsy();
            expect(properties.nativeElement.textContent).toContain(component.credentials.username);
            expect(properties.nativeElement.textContent).toContain(component.credentials.password);

            expect(de.query(By.css("bl-download-rdp"))).not.toBeFalsy();
            done();
        });
    });

    describe("clicking on specify", () => {
        beforeEach(() => {
            const button = de.queryAll(By.css("bl-submit-btn"))[1].componentInstance;
            button.submit();
            fixture.detectChanges();
        });

        it("should show the form", () => {
            expect(de.query(By.css("bl-node-user-credentials-form"))).not.toBeFalsy();
        });

        it("should add the user when form is submitted", () => {
            component.addOrUpdateUser({ username: "foo", password: "bar", isAdmin: false }).subscribe(() => null);
            fixture.detectChanges();
            const properties = de.query(By.css("bl-property-group"));

            expect(component.credentials).not.toBeFalsy();
            expect(component.credentials.username).toEqual("foo");
            expect(component.credentials.password).toEqual("bar");

            expect(properties).not.toBeFalsy();
            expect(properties.nativeElement.textContent).toContain("foo");
            expect(properties.nativeElement.textContent).not.toContain("bar");
            expect(de.query(By.css("bl-download-rdp"))).not.toBeFalsy();
        });
    });
});
