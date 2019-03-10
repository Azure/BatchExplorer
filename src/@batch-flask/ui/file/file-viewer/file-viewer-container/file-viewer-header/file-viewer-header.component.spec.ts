import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ServerError } from "@batch-flask/core";
import { TimeZoneTestingModule } from "@batch-flask/core/testing";
import { ElectronRemote, ElectronShell } from "@batch-flask/electron";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { DateModule } from "@batch-flask/ui/date";
import { File, FileLoader } from "@batch-flask/ui/file";
import { DateUtils } from "@batch-flask/utils";
import { of, throwError } from "rxjs";
import { click } from "test/utils/helpers";
import { NotificationServiceMock } from "test/utils/mocks";
import { FileViewerConfig } from "../../file-viewer";
import { FileViewerHeaderComponent } from "./file-viewer-header.component";

@Component({
    template: `<bl-file-viewer-header [fileLoader]="fileLoader" [config]="config"></bl-file-viewer-header>`,
})
class TestComponent {
    public fileLoader: FileLoader;

    public config: FileViewerConfig = {};
}

const date = new Date(2018, 10, 3, 9, 5);

describe("FileViewerHeaderComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let notificationSpy;
    let fileLoader: FileLoader;
    let file: File;
    let contentSpy: jasmine.Spy;
    let propertiesSpy: jasmine.Spy;

    beforeEach(() => {
        file = new File({ name: "foo.ts", properties: { contentLength: 12, lastModified: date } });
        contentSpy = jasmine.createSpy("content").and.returnValue("export const foo = 123;");
        propertiesSpy = jasmine.createSpy("propertiesGetter").and.callFake(() => of(file));
        fileLoader = new FileLoader({
            filename: "foo.ts",
            source: "some-source",
            fs: {} as any,
            content: contentSpy,
            properties: propertiesSpy,
        });

        notificationSpy = new NotificationServiceMock();
        TestBed.configureTestingModule({
            imports: [ButtonsModule, ElectronTestingModule, DateModule, TimeZoneTestingModule],
            declarations: [FileViewerHeaderComponent, TestComponent],
            providers: [
                notificationSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.fileLoader = fileLoader;
        de = fixture.debugElement.query(By.css("bl-file-viewer-header"));
        fixture.detectChanges();
    });

    it("show the filename", () => {
        expect(de.query(By.css(".filename")).nativeElement.textContent).toContain("foo.ts");
    });

    it("show the content length", () => {
        expect(de.query(By.css(".content-length")).nativeElement.textContent).toContain(12);
    });

    it("show last modified", () => {
        expect(de.query(By.css(".last-modified")).nativeElement.textContent).toContain(DateUtils.prettyDate(date));
    });

    it("refresh when clicking the refresh button", () => {
        expect(propertiesSpy).toHaveBeenCalledTimes(1);
        click(de.query(By.css("bl-refresh-btn bl-button")));
        expect(propertiesSpy).toHaveBeenCalledTimes(2);
    });

    describe("When download is enabled", () => {
        beforeEach(() => {
            testComponent.config = {
                downloadEnabled: true,
            };
            fixture.detectChanges();
        });

        it("shows the download button", () => {
            expect(de.query(By.css("bl-download-button bl-button"))).not.toBeFalsy();
        });

        it("download the file if clicking download button", () => {
            const downloadSpy = spyOn(testComponent.fileLoader, "download")
                .and.returnValue(of("/some/local/path/foo.ts"));
            click(de.query(By.css("bl-download-button bl-button")));
            expect(TestBed.get(ElectronRemote).dialog.showSaveDialog).toHaveBeenCalledOnce();
            expect(TestBed.get(ElectronRemote).dialog.showSaveDialog).toHaveBeenCalledWith({
                buttonLabel: "Download",
                defaultPath: "foo.ts",
            });
            expect(downloadSpy).toHaveBeenCalledOnce();
            expect(downloadSpy).toHaveBeenCalledWith("/some/local/path/foo.ts");

            // Show the item
            expect(TestBed.get(ElectronShell).showItemInFolder).toHaveBeenCalledOnce();
            expect(TestBed.get(ElectronShell).showItemInFolder).toHaveBeenCalledWith("/some/local/path/foo.ts");
        });

        it("show a notification if the download failed", () => {
            const downloadSpy = spyOn(testComponent.fileLoader, "download")
                .and.returnValue(throwError(new ServerError({ message: "Some fake error" } as any)));

            click(de.query(By.css("bl-download-button bl-button")));
            expect(downloadSpy).toHaveBeenCalledOnce();

            // Show the item
            expect(notificationSpy.error).toHaveBeenCalledOnce();
            expect(notificationSpy.error)
                .toHaveBeenCalledWith("Download failed", "foo.ts failed to download. Some fake error");
        });
    });

    it("open the file in the default editor", () => {
        const cacheSpy = spyOn(testComponent.fileLoader, "getLocalVersionPath")
            .and.returnValue(of("/some/local/path/foo.ts"));
        click(de.query(By.css("bl-button.open-in-default-app")));
        expect(cacheSpy).toHaveBeenCalledOnce();

        // Show the item
        expect(TestBed.get(ElectronShell).openItem).toHaveBeenCalledOnce();
        expect(TestBed.get(ElectronShell).openItem).toHaveBeenCalledWith("/some/local/path/foo.ts");
    });

});
