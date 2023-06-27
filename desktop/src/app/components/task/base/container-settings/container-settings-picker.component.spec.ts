import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { By } from "@angular/platform-browser";
import { FormModule } from "@batch-flask/ui/form";
import { updateInput } from "test/utils/helpers";
import { ContainerSettingsPickerComponent } from "./container-settings-picker.component";
import { RegistryPickerComponent } from "./registry-picker.component";

@Component({
    template: `<bl-container-settings-picker [formControl]="containerSettings"></bl-container-settings-picker>`,
})
class TestComponent {
    public containerSettings = new FormControl(null);
}

describe("ContainerSettingsPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let imageNameEl: DebugElement;
    let runOptionsEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, FormModule, MatAutocompleteModule, MatCheckboxModule],
            declarations: [ContainerSettingsPickerComponent, TestComponent, RegistryPickerComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-container-settings-picker"));
        fixture.detectChanges();

        imageNameEl = de.query(By.css("input[formControlName=imageName]"));
        runOptionsEl = de.query(By.css("input[formControlName=containerRunOptions]"));
    });

    it("has all the inputs", () => {
        expect(imageNameEl).not.toBeFalsy();
    });

    it("update inputs value with formControl", fakeAsync(() => {
        testComponent.containerSettings.setValue({
            imageName: "foo",
            containerRunOptions: "--some value",
        });
        tick();
        expect(imageNameEl.nativeElement.value).toEqual("foo");
        expect(runOptionsEl.nativeElement.value).toEqual("--some value");
    }));

    it("update form control when input changes", async () => {
        updateInput(imageNameEl, "ubuntu:16.04");
        expect(testComponent.containerSettings.value).toEqual({
            imageName: "ubuntu:16.04",
            containerRunOptions: null,
            registry: null,
        });
        updateInput(runOptionsEl, "--host");
        expect(testComponent.containerSettings.value).toEqual({
            imageName: "ubuntu:16.04",
            containerRunOptions: "--host",
            registry: null,
        });
    });

    it("set back to null when all the inputs are empty", fakeAsync(() => {
        testComponent.containerSettings.setValue({
            imageName: "foo",
        });
        tick();
        updateInput(imageNameEl, "");
        expect(testComponent.containerSettings.value).toBe(null);
    }));
});
