import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ElectronRemote, FileSystemService } from "@batch-flask/electron";
import { ButtonsModule, DialogService } from "@batch-flask/ui";
import { click } from "test/utils/helpers";
import { LocalTemplatePickButtonComponent } from "./local-template-pick-button.component";

@Component({
    template: `<bl-local-template-pick-button></bl-local-template-pick-button>`,
})
class TestComponent {
}

describe("LocalTemplatePickButtonComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let fsSpy;
    let dialogServiceSpy;
    let electronRemoteSpy;
    let dialogComponent;
    let de: DebugElement;
    let buttonEl: DebugElement;
    let pickFileResponse: string[] | undefined = ["~/foo.template.json"];

    beforeEach(() => {
        electronRemoteSpy = {
            dialog: {
                showOpenDialogSync: jasmine.createSpy("showOpenDialogSync").and.callFake(() => pickFileResponse),
            },
        };
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
            imports: [I18nTestingModule, ButtonsModule],
            declarations: [LocalTemplatePickButtonComponent, TestComponent],
            providers: [
                { provide: FileSystemService, useValue: fsSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: ElectronRemote, useValue: electronRemoteSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-local-template-pick-button"));
        fixture.detectChanges();

        buttonEl = de.query(By.css("bl-button"));
    });

    it("loads the file and open the dialog when dropping", async () => {
        click(buttonEl);
        fixture.detectChanges();

        expect(buttonEl.nativeElement.textContent).toContain("common.loading");
        expect(fsSpy.readFile).toHaveBeenCalledOnce();
        expect(fsSpy.readFile).toHaveBeenCalledWith("~/foo.template.json");
        expect(dialogServiceSpy.open).not.toHaveBeenCalled();

        await Promise.resolve(); // Wait for file load
        fixture.detectChanges();
        expect(buttonEl.nativeElement.textContent).not.toContain("common.loading");
        expect(dialogServiceSpy.open).toHaveBeenCalledOnce();
        expect(dialogComponent).toEqual({
            filename: "~/foo.template.json",
            template: `{"foo": 123}`,
        });
    });

    it("does nothing if user cancel file picker", async () => {
        pickFileResponse = undefined;
        click(buttonEl);
        fixture.detectChanges();

        expect(buttonEl.nativeElement.textContent).not.toContain("common.loading");
        expect(fsSpy.readFile).not.toHaveBeenCalled();
        expect(dialogServiceSpy.open).not.toHaveBeenCalled();
    });

    it("does nothing if no files got selected", async () => {
        pickFileResponse = [];
        click(buttonEl);
        fixture.detectChanges();

        expect(buttonEl.nativeElement.textContent).not.toContain("common.loading");
        expect(fsSpy.readFile).not.toHaveBeenCalled();
        expect(dialogServiceSpy.open).not.toHaveBeenCalled();
    });
});
