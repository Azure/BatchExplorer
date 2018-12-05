import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    AbstractControl,
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";

import { RenderEngine } from "app/models/rendering-container-image";
import { RenderingContainerImageService } from "app/services";
import { Subscription } from "rxjs";
import "./rendering-container-image-picker.scss";

@Component({
    selector: "bl-rendering-container-image-picker",
    templateUrl: "rendering-container-image-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() =>
            RenderingContainerImagePickerComponent), multi: true },
        RenderingContainerImageService,
    ],
})
export class RenderingContainerImagePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input() public appVersionLabel: string;
    @Input() public rendererVersionLabel: string;
    @Input() public imageReferenceId: string;
    @Input() public renderEngine: string; // TODO should be cast and stored as enum type RenderEngine once to validate
    @Input() public hint: string;

    public containerImage: string;
    public pickerFormGroup: FormGroup;

    public pickedAppVersion: FormControl<string>;
    public pickedRendererVersion: FormControl<string>;
    public pickedContainerImage: FormControl<string>;
    public warning = false;

    public appVersions: string[] = [];
    public rendererVersions: string[] = [];

    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private renderingContainerImageService: RenderingContainerImageService,
        private formBuilder: FormBuilder) {

        this.pickedAppVersion = this.formBuilder.control("", null);
        this.pickedRendererVersion = this.formBuilder.control("", null);

        this.pickerFormGroup = this.formBuilder.group({
            pickedContainerImage: this.pickedContainerImage,
            pickedAppVersion: this.pickedAppVersion,
            pickedRendererVersion: this.pickedRendererVersion},
        );

        this._subs.push(this._appVersionOnChangeSub());
        this._subs.push(this._rendererVersionOnChangeSub());
    }

    public writeValue(value: string) {
        // tslint:disable-next-line:no-console
        console.log("Writing Value:");
        // tslint:disable-next-line:no-console
        console.log(value);
        this.pickerFormGroup.patchValue([this.pickedContainerImage, value]);
    }

    public setDisabledState?(isDisabled: boolean): void {
        throw new Error("Method not implemented.");
    }

    public trackAppVersion(_, image: string) {
        return this.pickedAppVersion;
    }

    public trackRendererVersion(_, image: string) {
        return this.pickedRendererVersion;
    }

    public get selectedAppVersion() {
        return this.pickerFormGroup.controls.pickedAppVersion.value;
    }

    public get selectedRendererVersion() {
        return this.pickerFormGroup.controls.pickedRendererVersion.value;
    }
    public ngOnInit() {
        this.renderingContainerImageService.loadImageData().then(() =>

        this.appVersions = Array.from(
            this.renderingContainerImageService.getMayaDisplayList(this.imageReferenceId).values()));
    }

    public ngOnDestroy() {
        this._subs.forEach(sub => sub.unsubscribe());
    }

    public registerOnChange(fn) {
         // Do nothing
    }

    public registerOnTouched() {
        // Do nothing
    }

    private _appVersionOnChangeSub(): Subscription {
        return this.pickedAppVersion.valueChanges.subscribe((appVersion: string) => {
            this._setFormValue(this.pickedRendererVersion, null);

            this.rendererVersions = Array.from(
                this.renderingContainerImageService.getRendererDisplayList(RenderEngine[this.renderEngine],
                this.imageReferenceId, appVersion).values());

            this.changeDetector.markForCheck();
        });
    }

    private _rendererVersionOnChangeSub(): Subscription {
        return this.pickerFormGroup.controls.pickedRendererVersion.valueChanges.subscribe((rendererVersion: string) => {
            this.containerImage = this.renderingContainerImageService.getSelectedContainerImage(
                RenderEngine[this.renderEngine], this.imageReferenceId, this.selectedAppVersion, rendererVersion);

            this.changeDetector.markForCheck();
        });
    }

    private _setFormValue(control: AbstractControl, value: any) {
        control.setValue(value);
        if (value) {
            control.markAsTouched();
        } else {
            control.markAsUntouched();
        }
        control.updateValueAndValidity();
    }
}
