import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ElectronShell } from "@batch-flask/ui";
import * as path from "path";

import { ButtonComponent } from "@batch-flask/ui/buttons";
import { PermissionService } from "@batch-flask/ui/permission";
import { DownloadRdpComponent } from "app/components/node/connect";
import { NodeConnectionSettings } from "app/models";
import { FileSystemService } from "app/services";
import { OS } from "app/utils";

@Component({
    template: `
        <bl-download-rdp nodeId="node-1" [rdpContent]="rdpContent" [credentials]="credentials"
            [connectionSettings]="connectionSettings">
        </bl-download-rdp>
    `,
})
class DownloadRdpMockComponent {
    public rdpContent: string = "full address:s:0.0.0.0";
    public credentials = { name: "foo" };
    public connectionSettings: NodeConnectionSettings;
}

describe("DownloadRdpComponent", () => {
    let fixture: ComponentFixture<DownloadRdpMockComponent>;
    let testComponent: DownloadRdpMockComponent;
    let component: DownloadRdpComponent;
    let de: DebugElement;
    let fsServiceSpy;
    let shellSpy;

    beforeEach(() => {
        fsServiceSpy = {
            commonFolders: {
                temp: "temp-folder",
                downloads: "download-folder",
            },

            saveFile: jasmine.createSpy("SaveFile").and.returnValue(Promise.resolve("temp-folder/file.rdp")),
        };

        shellSpy = {
            showItemInFolder: jasmine.createSpy("showItemInFolder"),
            openItem: jasmine.createSpy("openItem"),
        };

        TestBed.configureTestingModule({
            declarations: [DownloadRdpComponent, DownloadRdpMockComponent, ButtonComponent],
            providers: [
                { provide: PermissionService, useValue: null },
                { provide: FileSystemService, useValue: fsServiceSpy },
                { provide: ElectronShell, useValue: shellSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(DownloadRdpMockComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-download-rdp"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("when rdp content is provided use it", () => {
        testComponent.rdpContent = "full address:s:1.1.1.1";
        fixture.detectChanges();
        expect(component.rdpBaseContent).toEqual("full address:s:1.1.1.1");
    });

    it("when connection settings are provided, build the rdp from those", () => {
        testComponent.rdpContent = null;
        testComponent.connectionSettings = new NodeConnectionSettings({
            remoteLoginIPAddress: "1.2.3.4",
            remoteLoginPort: 4321,
        });
        fixture.detectChanges();
        expect(component.rdpBaseContent).toEqual("full address:s:1.2.3.4:4321");
    });

    describe("When OS is windows", () => {
        beforeEach(() => {
            spyOn(OS, "isWindows").and.returnValue(true);
            testComponent.credentials = { name: "bar" };
            fixture.detectChanges();
        });

        it("download folder should be in temp dir", () => {
            expect(component.downloadFolder).toBe(path.join("temp-folder", "rdp"));
        });

        it("should have 1 button proposing to connect", () => {
            const btn = de.query(By.css("bl-button"));
            expect(btn).not.toBeFalsy();
            expect(btn.nativeElement.textContent).toContain("Connect");
        });

        it("should save the rdp file when submitting", (done) => {
            const btn = de.query(By.css("bl-button")).componentInstance;
            btn.action().subscribe(() => {
                expect(fsServiceSpy.saveFile).toHaveBeenCalledOnce();
                const expectedContent = "full address:s:0.0.0.0\nusername:s:.\\bar\nprompt for credentials:i:1";
                expect(fsServiceSpy.saveFile).toHaveBeenCalledWith(
                    path.join("temp-folder", "rdp", "node-1.rdp"),
                    expectedContent);

                expect(shellSpy.openItem).toHaveBeenCalledOnce();
                expect(shellSpy.showItemInFolder).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe("When OS is NOT windows", () => {
        beforeEach(() => {
            spyOn(OS, "isWindows").and.returnValue(false);
            testComponent.credentials = { name: "bar" };
            fixture.detectChanges();
        });

        it("download folder should be in downloads dir", () => {
            expect(component.downloadFolder).toEqual("download-folder");
        });

        it("should have 1 button proposing to download", () => {
            const btn = de.query(By.css("bl-button"));
            expect(btn).not.toBeFalsy();
            fixture.detectChanges();
            expect(btn.nativeElement.textContent).toContain("Download rdp file");
        });

        it("should save the rdp file when submitting", (done) => {
            const btn = de.query(By.css("bl-button")).componentInstance;
            btn.action().subscribe(() => {
                expect(fsServiceSpy.saveFile).toHaveBeenCalledOnce();
                const expectedContent = "full address:s:0.0.0.0\nusername:s:.\\bar\nprompt for credentials:i:1";
                expect(fsServiceSpy.saveFile).toHaveBeenCalledWith(
                    path.join("download-folder", "node-1.rdp"),
                    expectedContent);

                expect(shellSpy.showItemInFolder).toHaveBeenCalledOnce();
                expect(shellSpy.openItem).not.toHaveBeenCalled();
                done();
            });
        });
    });
});
