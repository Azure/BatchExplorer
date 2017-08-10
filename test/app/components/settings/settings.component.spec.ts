import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { fakeAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { tick } from "@angular/core/testing";
import { ButtonComponent } from "app/components/base/buttons";
import { EditorComponent } from "app/components/base/editor";
import { SettingsComponent } from "app/components/settings";
import { SettingsService } from "app/services";

// tslint:disable-next-line:no-var-requires
const defaultSettingsStr = require("app/components/settings/default-settings.json");

const userInitialSettings = `{\n"other": "overide"\n}`;
const invalidUserInitialSettings = `{\n"other": \n}`;

@Component({
    template: `<bl-settings></bl-settings>`,
})
class TestComponent {
}

fdescribe("SettingsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: SettingsComponent;
    let de: DebugElement;

    let leftEditor: EditorComponent;
    let rightEditor: EditorComponent;
    let settingsServiceSpy;

    beforeEach(() => {
        settingsServiceSpy = {
            userSettingsStr: userInitialSettings,
            settingsObs: Observable.of({ some: "value" }),
        };
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MaterialModule],
            declarations: [SettingsComponent, TestComponent, ButtonComponent, EditorComponent],
            providers: [
                { provide: SettingsService, useValue: settingsServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-settings"));
        component = de.componentInstance;
        fixture.detectChanges();

        leftEditor = de.query(By.css(".default-settings bl-editor")).componentInstance;
        rightEditor = de.query(By.css(".user-settings bl-editor")).componentInstance;

        expect(leftEditor).not.toBeFalsy();
        expect(leftEditor).not.toBeFalsy();
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
        console.log("Valid?", component.userSettings.valid);
        console.log("ERr", errorEl && errorEl.nativeElement.textContent);
        expect(errorEl).toBeFalsy();
    }));

    it("should validate invalid user settings", fakeAsync(() => {
        rightEditor.updateValue(invalidUserInitialSettings);
        tick(400);
        fixture.detectChanges();

        const errorEl = de.query(By.css(".user-settings .label .error"));
        expect(errorEl).not.toBeFalsy();

        expect(errorEl.nativeElement.textContent).toContain("Unexpected token } in JSON at position 12");
    }));
});
