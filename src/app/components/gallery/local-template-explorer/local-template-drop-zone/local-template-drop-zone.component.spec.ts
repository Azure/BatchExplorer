import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FileSystemService } from "@batch-flask/electron";
import { DialogService } from "@batch-flask/ui";
import { FakeDataTransfer, FakeDragEvent, sendEvent } from "test/utils/helpers";
import { NotificationServiceMock } from "test/utils/mocks";
import { LocalTemplateDropZoneComponent } from "./local-template-drop-zone.component";

@Component({
    template: `<bl-local-template-drop-zone></bl-local-template-drop-zone>`,
})
class TestComponent {
}

describe("LocalTemplateDropZoneComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let fsSpy;
    let dialogServiceSpy;
    let dialogComponent;
    let notificationServiceSpy: NotificationServiceMock;
    let de: DebugElement;

    beforeEach(() => {
        notificationServiceSpy = new NotificationServiceMock();
        fsSpy = {
            readFile: jasmine.createSpy("fs.readFile").and.returnValue(Promise.resolve(`{"foo": 123}`)),
        };

        dialogComponent = {
            filename: null,
            template: null,
        };

        dialogServiceSpy = {
            open: jasmine.createSpy("fs.readFile").and.returnValue({
                componentInstance: dialogComponent,
            }),
        };
        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            declarations: [LocalTemplateDropZoneComponent, TestComponent],
            providers: [
                { provide: FileSystemService, useValue: fsSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
                notificationServiceSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-local-template-drop-zone"));
        fixture.detectChanges();
    });

    function getOverlay() {
        return de.query(By.css(".drop-overlay"));
    }

    it("shows the drop overlay when dragging and hide when stopping", () => {
        const dataTransfer = {
            types: ["Files"],
            files: [{ path: "~/foo.template.json" } as any],
        };
        sendEvent(de, new FakeDragEvent("dragenter", { dataTransfer }));
        fixture.detectChanges();
        expect(getOverlay()).not.toBeFalsy();

        sendEvent(de, new FakeDragEvent("dragleave", { dataTransfer }));
        fixture.detectChanges();
        expect(getOverlay()).toBeFalsy();
    });

    it("updates the data transfer object with the effect", () => {
        const dataTransfer: FakeDataTransfer = {
            types: ["Files"],
            files: [{ path: "~/foo.template.json" } as any],
        };
        sendEvent(de, new FakeDragEvent("dragover", { dataTransfer }));
        expect(dataTransfer.dropEffect).toEqual("move");
    });

    it("sends an error notification if dropping multiple files", async () => {
        const event = new FakeDragEvent("drop", {
            dataTransfer: {
                types: ["Files"],
                files: [{ path: "~/foo.template.json" } as any, { path: "~/bar.template.json" } as any],
            } as any,
        });
        sendEvent(de, event);
        fixture.detectChanges();

        expect(getOverlay()).toBeFalsy();
        expect(fsSpy.readFile).not.toHaveBeenCalled();
        expect(notificationServiceSpy.error).toHaveBeenCalledOnce();
        expect(notificationServiceSpy.error).toHaveBeenCalledWith(
            "Can't use mutliple files",
            "Please drop only one file at the time",
        );
    });

    it("loads the file and open the dialog when dropping", async () => {
        const event = new FakeDragEvent("drop", {
            dataTransfer: {
                types: ["Files"],
                files: [{ path: "~/foo.template.json" } as any],
            } as any,
        });
        sendEvent(de, event);
        fixture.detectChanges();

        expect(getOverlay()).not.toBeFalsy();
        expect(getOverlay().nativeElement.textContent).toContain("commmon.loading");
        expect(fsSpy.readFile).toHaveBeenCalledOnce();
        expect(fsSpy.readFile).toHaveBeenCalledWith("~/foo.template.json");
        expect(dialogServiceSpy.open).not.toHaveBeenCalled();

        await Promise.resolve(); // Wait for file load
        fixture.detectChanges();
        expect(getOverlay()).toBeFalsy();
        expect(dialogServiceSpy.open).toHaveBeenCalledOnce();
        expect(dialogComponent).toEqual({
            filename: "~/foo.template.json",
            template: `{"foo": 123}`,
        });
    });
});
