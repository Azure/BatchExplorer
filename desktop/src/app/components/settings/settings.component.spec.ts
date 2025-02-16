import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { UserConfigurationService } from "@batch-flask/core";
import { I18nTestingModule, MockUserConfigurationService } from "@batch-flask/core/testing";
import { FormModule, SelectComponent, SelectModule, SlideToggleComponent, ToolbarModule } from "@batch-flask/ui";
import { ButtonComponent, ButtonsModule } from "@batch-flask/ui/buttons";
import { PermissionService } from "@batch-flask/ui/permission";
import { SettingsComponent } from "app/components/settings";
import { BEUserConfiguration, DEFAULT_BE_USER_CONFIGURATION } from "common";
import { updateInput } from "test/utils/helpers";

@Component({
    template: `<bl-settings></bl-settings>`,
})
class TestComponent {
}

describe("SettingsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;

    let resetButtonEl: DebugElement;
    let resetButton: ButtonComponent;

    let externalBrowserAuthToggleEl: DebugElement;
    let externalBrowserAuthToggle: SlideToggleComponent;

    let settingsServiceSpy: MockUserConfigurationService<BEUserConfiguration>;

    let themeSelect: SelectComponent;

    beforeEach(() => {
        settingsServiceSpy = new MockUserConfigurationService(DEFAULT_BE_USER_CONFIGURATION);
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                NoopAnimationsModule,
                FormModule,
                SelectModule,
                I18nTestingModule,
                ToolbarModule,
                ButtonsModule,
            ],
            declarations: [SettingsComponent, TestComponent],
            providers: [
                { provide: PermissionService, useValue: null },
                { provide: UserConfigurationService, useValue: settingsServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-settings"));
        fixture.detectChanges();

        resetButtonEl = de.query(By.css("bl-button.reset"));
        resetButton = resetButtonEl.componentInstance;

        externalBrowserAuthToggleEl = de.query(
            By.css("be-slide-toggle[formControlName=externalBrowserAuth]"));
        externalBrowserAuthToggle =
            externalBrowserAuthToggleEl.componentInstance;

        themeSelect = de.query(By.css("bl-select[formControlName=theme]")).componentInstance;

    });

    it("disable the reset button when settings are the defaults", () => {
        expect(resetButton.disabled).toBe(true);
    });

    it("enable the reset button when settings are NOT the defaults", () => {
        settingsServiceSpy.patch({ theme: "dark" });
        fixture.detectChanges();
        expect(resetButton.disabled).toBe(false);
    });

    it("updates the externalBrowserAuth setting", fakeAsync(() => {
        tick(400);
        expect(settingsServiceSpy.current.externalBrowserAuth).toBe(true);
        externalBrowserAuthToggleEl.triggerEventHandler("toggleChange", false);
        tick(1000);
        fixture.detectChanges();
        expect(settingsServiceSpy.current.externalBrowserAuth).toBe(false);
        tick(1000);
        expect(settingsServiceSpy.current.externalBrowserAuth).toBe(false);
    }));

    it("updates the theme", fakeAsync(() => {
        tick(400);
        expect(settingsServiceSpy.current.theme).toEqual("classic");
        themeSelect.selectOption(themeSelect.options.toArray()[1]);
        fixture.detectChanges();
        expect(settingsServiceSpy.current.theme).toEqual("classic");
        tick(400);
        expect(settingsServiceSpy.current.theme).toEqual("dark");
        tick(10000);
        expect(settingsServiceSpy.current.theme).toEqual("dark");
    }));
});
