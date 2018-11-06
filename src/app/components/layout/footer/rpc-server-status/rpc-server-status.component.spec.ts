import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTooltip, MatTooltipModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { ClickableComponent, FileSystemService } from "@batch-flask/ui";
import { PythonRpcService } from "app/services";
import { BehaviorSubject } from "rxjs";
import { click } from "test/utils/helpers";
import { ContextMenuServiceMock } from "test/utils/mocks";
import { RpcServerStatusComponent } from "./rpc-server-status.component";

@Component({
    template: `<bl-rpc-server-status></bl-rpc-server-status>`,
})
class TestComponent {
}

describe("RpcServerStatusComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let clickableEl: DebugElement;

    let contextMenuServiceSpy: ContextMenuServiceMock;
    let pythonRpcServiceSpy;

    beforeEach(() => {
        pythonRpcServiceSpy = {
            connected: new BehaviorSubject(true),
        };
        contextMenuServiceSpy = new ContextMenuServiceMock();

        TestBed.configureTestingModule({
            imports: [ElectronTestingModule, MatTooltipModule],
            declarations: [RpcServerStatusComponent, TestComponent, ClickableComponent],
            providers: [
                { provide: PythonRpcService, useValue: pythonRpcServiceSpy },
                { provide: FileSystemService, useValue: {} },
                contextMenuServiceSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-rpc-server-status"));
        clickableEl = fixture.debugElement.query(By.css("bl-clickable"));
        fixture.detectChanges();
    });

    describe("when connected", () => {
        it("Shows connected icon", () => {
            expect(de.query(By.css(".fa.fa-link"))).not.toBeFalsy();
            expect(de.query(By.css(".fa.fa-exclamation-triangle"))).toBeFalsy();
        });

        it("Shows connected title", () => {
            const tooltip = clickableEl.injector.get(MatTooltip);
            expect(tooltip.message).toEqual("Python service is connnected and running.");
        });

        it("Opens context menu when clicking ", () => {
            click(clickableEl);

            expect(contextMenuServiceSpy.openMenu).toHaveBeenCalledOnce();
            expect(contextMenuServiceSpy.lastMenu.items.length).toBe(4);
        });
    });

    describe("when not connected", () => {
        beforeEach(() => {
            pythonRpcServiceSpy.connected.next(false);
            fixture.detectChanges();
        });

        it("Shows connected icon", () => {
            expect(de.query(By.css(".fa.fa-link"))).toBeFalsy();
            expect(de.query(By.css(".fa.fa-exclamation-triangle"))).not.toBeFalsy();
        });

        it("Shows diconnected title", () => {
            const tooltip = clickableEl.injector.get(MatTooltip);
            expect(tooltip.message).toEqual("Python service is currently disconnected. Click to take action.");
        });

        it("Opens context menu when clicking", () => {
            click(clickableEl);

            expect(contextMenuServiceSpy.openMenu).toHaveBeenCalledOnce();
            expect(contextMenuServiceSpy.lastMenu.items.length).toBe(3);
        });
    });
});
