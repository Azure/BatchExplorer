import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { SelectComponent, SelectModule } from "@batch-flask/ui";
import { FormModule } from "@batch-flask/ui/form";
import { ContainerConfigurationAttributes, ContainerType } from "app/models";
import { ContainerConfigurationDto } from "app/models/dtos";
import { ContainerConfigurationPickerComponent } from "./container-configuration-picker.component";
import { ContainerImagesPickerComponent } from "./images-picker/container-images-picker.component";
import { ContainerRegistryPickerComponent } from "./registry-picker/container-registry-picker.component";

@Component({
    template: `<bl-container-configuration-picker [formControl]="containerConfig"></bl-container-configuration-picker>`,
})
class TestComponent {
    public containerConfig = new FormControl(null);
}

describe("ContainerConfigurationPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let containerTypeSelect: SelectComponent;
    let imagePicker: ContainerImagesPickerComponent;
    let registryPicker: ContainerRegistryPickerComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, SelectModule, FormModule, I18nTestingModule],
            declarations: [
                ContainerConfigurationPickerComponent,
                TestComponent,
                ContainerImagesPickerComponent,
                ContainerRegistryPickerComponent,
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-container-configuration-picker"));
        fixture.detectChanges();

        containerTypeSelect = de.query(By.css("bl-select")).componentInstance;
        imagePicker = de.query(By.css("bl-container-images-picker")).componentInstance;
        registryPicker = de.query(By.css("bl-container-registry-picker")).componentInstance;
    });

    it("has all the controls", () => {
        expect(containerTypeSelect).not.toBeFalsy();
        expect(imagePicker).not.toBeFalsy();
        expect(registryPicker).not.toBeFalsy();
    });

    it("containerType default to Docker compatible", () => {
        expect(containerTypeSelect.value).toEqual(ContainerType.DockerCompatible);
    });

    it("write value to all the controls", () => {
        testComponent.containerConfig.setValue({
            type: ContainerType.DockerCompatible,
            containerImageNames: ["ubuntu:18.04", "ubuntu:16.04"],
            containerRegistries: [
                { username: "foo", password: "pass123!", registryServer: "https://bar.com" },
            ],
        } as ContainerConfigurationAttributes);
        fixture.detectChanges();
        expect(containerTypeSelect.value).toEqual(ContainerType.DockerCompatible);
        expect(imagePicker.images.value).toEqual([
            { imageName: "ubuntu:18.04" },
            { imageName: "ubuntu:16.04" },
        ]);
        expect(registryPicker.registries.value).toEqual([
            { username: "foo", password: "pass123!", registryServer: "https://bar.com" },
        ]);
    });

    it("propagate changes when updating the images", () => {
        imagePicker.images.setValue([
            { imageName: "ubuntu:18.04" },
            { imageName: "ubuntu:16.04" },
        ]);
        fixture.detectChanges();
        expect(testComponent.containerConfig.value).toEqual(new ContainerConfigurationDto({
            type: ContainerType.DockerCompatible,
            containerImageNames: ["ubuntu:18.04", "ubuntu:16.04"],
            containerRegistries: [],
        }));
    });

    it("propagate changes when updating the registries", () => {
        registryPicker.registries.setValue([
            { username: "foo", password: "pass123!", registryServer: "https://bar.com" },
        ]);
        fixture.detectChanges();
        expect(testComponent.containerConfig.value).toEqual(new ContainerConfigurationDto({
            type: ContainerType.DockerCompatible,
            containerImageNames: [],
            containerRegistries: [
                { username: "foo", password: "pass123!", registryServer: "https://bar.com" },
            ],
        }));
    });
});
