import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule, UserConfigurationService } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ToolbarModule } from "@batch-flask/ui";
import { ButtonComponent } from "@batch-flask/ui/buttons";
import { PermissionService } from "@batch-flask/ui/permission";
import { EditorTestingModule } from "@batch-flask/ui/testing";
import { SettingsComponent } from "app/components/settings";
import { of } from "rxjs";

@Component({
    template: `<bl-settings></bl-settings>`,
})
class TestComponent {
}

describe("SettingsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: SettingsComponent;
    let de: DebugElement;

    let resetButtonEl: DebugElement;
    let resetButton: ButtonComponent;

    let settingsServiceSpy;

    beforeEach(() => {
        settingsServiceSpy = {
            config: of({ some: "value" }),
        };
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule, MaterialModule, NoopAnimationsModule,
                EditorTestingModule, I18nTestingModule, ToolbarModule,
            ],
            declarations: [SettingsComponent, TestComponent, ButtonComponent],
            providers: [
                { provide: PermissionService, useValue: null },
                { provide: UserConfigurationService, useValue: settingsServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-settings"));
        component = de.componentInstance;
        fixture.detectChanges();

        resetButtonEl = de.query(By.css("bl-button[title='Reset']"));
        resetButton = resetButtonEl.componentInstance;
    });

});
