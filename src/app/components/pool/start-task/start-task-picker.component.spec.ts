import { CommonModule } from "@angular/common";
import { Component, DebugElement, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { TranslationsLoaderService } from "@batch-flask/core";
import { MockControlValueAccessorComponent, controlValueAccessorProvider } from "@batch-flask/core/testing";
import { FormModule } from "@batch-flask/ui";
import { UserAccount } from "app/models";
import { ContainerConfigurationDto } from "app/models/dtos";
import { List } from "immutable";
import { StartTaskPickerComponent } from "./start-task-picker.component";

@Component({
    template: `
        <bl-start-task-picker>
        </bl-start-task-picker>
    `,
})
class TestComponent {
    public form = FormGroup;
}

@Component({
    selector: "bl-user-identity-picker", template: "",
    providers: [controlValueAccessorProvider(() => MockUserIdentityPickerComponent)],
})
class MockUserIdentityPickerComponent extends MockControlValueAccessorComponent<string> {
    @Input() public userAccounts: List<UserAccount> | UserAccount[];
}

@Component({
    selector: "bl-container-settings-picker", template: "",
    providers: [controlValueAccessorProvider(() => MockContainerSettingsPickerComponent)],
})
class MockContainerSettingsPickerComponent extends MockControlValueAccessorComponent<string> {
    @Input() public containerConfiguration: ContainerConfigurationDto = null;
}

@Component({
    selector: "bl-resourcefile-picker", template: "",
    providers: [controlValueAccessorProvider(() => MockResourceFilePickerComponent)],
})
class MockResourceFilePickerComponent extends MockControlValueAccessorComponent<string> {
    @Input() public label = "Resource files";
    @Input() public hideCaption = false;
}

describe("StartTaskPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: StartTaskPickerComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormModule,
                FormsModule,
                ReactiveFormsModule,
                MatCheckboxModule,
            ],
            declarations: [
                StartTaskPickerComponent,
                TestComponent,
                MockUserIdentityPickerComponent,
                MockContainerSettingsPickerComponent,
                MockResourceFilePickerComponent,
            ],
            providers: [
                FormBuilder,
                TranslationsLoaderService,
            ],
        });

        setup();
    });

    function setup() {
        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css("bl-start-task-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    }

    it("should default waitForSuccess checkbox value as true", () => {
        expect(component.form.value.waitForSuccess).toBe(true);
    });
});
