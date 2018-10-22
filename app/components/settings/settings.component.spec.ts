import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@batch-flask/core";
import { ButtonComponent } from "@batch-flask/ui/buttons";
import { EditorComponent } from "@batch-flask/ui/editor";
import { PermissionService } from "@batch-flask/ui/permission";
import { EditorTestingModule } from "@batch-flask/ui/testing";
import { SettingsComponent } from "app/components/settings";
import { SettingsService } from "app/services";
import { of } from "rxjs";
import { click } from "test/utils/helpers";

// tslint:disable-next-line:no-var-requires
const defaultSettingsStr = require("app/components/settings/default-settings.json");

const userInitialSettings = `{\n"other": "overide"\n}`;
const validUserSettings = `{\n"other": "new value"\n}`;
const invalidUserSettings = `{\n"other": \n}`;

@Component({
    template: `<bl-settings></bl-settings>`,
})
class TestComponent {
}

describe("SettingsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: SettingsComponent;
    let de: DebugElement;

    let leftEditor: EditorComponent;
    let rightEditor: EditorComponent;

    let saveButtonEl: DebugElement;
    let saveButton: ButtonComponent;
    let resetButtonEl: DebugElement;
    let resetButton: ButtonComponent;

    let settingsServiceSpy;

    beforeEach(() => {
        settingsServiceSpy = {
            userSettingsStr: userInitialSettings,
            settingsObs: of({ some: "value" }),
            saveUserSettings: jasmine.createSpy("saveUserSettings"),
        };
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule, EditorTestingModule],
            declarations: [SettingsComponent, TestComponent, ButtonComponent],
            providers: [
                { provide: PermissionService, useValue: null },
                { provide: SettingsService, useValue: settingsServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-settings"));
        component = de.componentInstance;
        fixture.detectChanges();

        leftEditor = de.query(By.css(".default-settings bl-editor")).componentInstance;
        rightEditor = de.query(By.css(".user-settings bl-editor")).componentInstance;

        saveButtonEl = de.query(By.css("bl-button[title='Save']"));
        saveButton = saveButtonEl.componentInstance;
        resetButtonEl = de.query(By.css("bl-button[title='Reset']"));
        resetButton = resetButtonEl.componentInstance;
        expect(leftEditor).not.toBeFalsy();
        expect(leftEditor).not.toBeFalsy();
    });

    it("Should not enable save button", () => {
        expect(saveButton.disabled).toBe(true);
    });

    it("Should not enable reset button", () => {
        expect(resetButton.disabled).toBe(true);
    });

    it("left editor should show the default settings", () => {
        expect(leftEditor.value).toEqual(defaultSettingsStr);
    });

    it("right editor should show the user settings loaded from the service", () => {
        expect(rightEditor.value).toEqual(userInitialSettings);

    });

    it("should not show any error", fakeAsync(() => {
        rightEditor.updateValue(userInitialSettings);
        tick(400);
        fixture.detectChanges();
        const errorEl = de.query(By.css(".user-settings .label .error"));
        expect(component.userSettings.valid).toBe(true);
        expect(errorEl).toBeFalsy();
    }));

    describe("when using invalid settings", () => {
        beforeEach(fakeAsync(() => {
            rightEditor.updateValue(invalidUserSettings);
            discardPeriodicTasks();
            tick(400);
            fixture.detectChanges();
        }));

        it("should validate invalid user settings", () => {
            expect(component.userSettings.valid).toBe(false);

            const errorEl = de.query(By.css(".user-settings .editor-header .error"));
            expect(errorEl).not.toBeFalsy();

            expect(errorEl.nativeElement.textContent).toContain("Unexpected token } in JSON at position 12");
        });

        it("should disable the save button", () => {
            expect(saveButton.disabled).toBe(true);
        });

        it("should enable reset button", () => {
            expect(resetButton.disabled).toBe(false);
        });

        it("clicking reset button should reset form", () => {
            click(resetButtonEl);
            fixture.detectChanges();

            expect(rightEditor.value).toEqual(userInitialSettings);
        });
    });

    describe("when using valid settings", () => {
        beforeEach(fakeAsync(() => {
            rightEditor.updateValue(validUserSettings);
            discardPeriodicTasks();
            tick(400);
            fixture.detectChanges();
        }));

        it("should enable the save button", () => {
            expect(saveButton.disabled).toBe(false);
        });

        it("should show asterix on save button", () => {
            expect(saveButtonEl.nativeElement.textContent).toContain("*");
        });

        it("should enable reset button", () => {
            expect(resetButton.disabled).toBe(false);
        });

        it("clicking save button should call the save settings", () => {
            click(saveButtonEl);
            fixture.detectChanges();

            expect(settingsServiceSpy.saveUserSettings).toHaveBeenCalledOnce();
            expect(settingsServiceSpy.saveUserSettings).toHaveBeenCalledWith(validUserSettings);
            expect(rightEditor.value).toEqual(validUserSettings);
        });
    });
});
