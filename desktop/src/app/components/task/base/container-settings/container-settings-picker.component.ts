import { ChangeDetectionStrategy, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { ContainerConfigurationDto, TaskContainerSettingsDto } from "app/models/dtos";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-container-settings-picker",
    templateUrl: "container-settings-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ContainerSettingsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContainerSettingsPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerSettingsPickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public containerConfiguration: ContainerConfigurationDto = null;
    public containerSettings: FormGroup;

    private _propagateChange: (value: TaskContainerSettingsDto) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.containerSettings = this.formBuilder.group({
            imageName: [""],
            containerRunOptions: [null],
            registry: [null],
        });

        this._sub = this.containerSettings.valueChanges.subscribe((containerSettings) => {
            if (this._propagateChange) {
                if (containerSettings.imageName) {
                    this._propagateChange(containerSettings);
                } else {
                    this._propagateChange(null);
                }
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: TaskContainerSettingsDto) {
        if (value) {
            this.containerSettings.setValue({
                imageName: value.imageName,
                containerRunOptions: value.containerRunOptions || null,
                registry: value.registry || null,
            });
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.containerSettings.valid;
        if (!valid) {
            return {
                ContainerSettingsPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }
        return null;
    }

    public trackImage(index, image: string) {
        return image;
    }
}
