import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { RenderApplication, RenderEngine, RenderingContainerImage } from "app/models/rendering-container-image";
import { RenderingContainerImageService } from "app/services";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import "./rendering-container-image-picker.scss";

@Component({
    selector: "bl-rendering-container-image-picker",
    templateUrl: "rendering-container-image-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() =>
                RenderingContainerImagePickerComponent), multi: true,
        },
    ],
})

export class RenderingContainerImagePickerComponent implements ControlValueAccessor, OnChanges, OnDestroy {

    public get appDisplay() {
        return this._upperCaseFirstChar(this.app);
    }

    public get renderEngineDisplay() {
        return this._upperCaseFirstChar(this.renderEngine);
    }

    public removeSelectionOption = "---- Remove Selection ----";
    public appVersionControl = new FormControl();
    public rendererVersionControl = new FormControl();

    public appVersions: string[];
    public rendererVersions: string[];
    public containerImages: RenderingContainerImage[];

    public containerImage: string;

    @Input() public app: RenderApplication;
    @Input() public imageReferenceId: string;
    @Input() public renderEngine: RenderEngine;

    private _app = new BehaviorSubject(null);
    private _imageReferenceId = new BehaviorSubject(null);
    private _renderEngine = new BehaviorSubject(null);

    private _propagateChange: (value: string) => void = null;

    private _destroy = new Subject();

    private containerImagesMap: Map<string, RenderingContainerImage>;
    private allAppVersions: string[];
    private allRendererVersions: string[];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private renderingContainerImageService: RenderingContainerImageService) {

        combineLatest(this._app, this._renderEngine, this._imageReferenceId).pipe(
            takeUntil(this._destroy),
            switchMap(([app, renderEngine, imageReferenceId]) => {
                return this.renderingContainerImageService.getFilteredcontainerImages(
                    app, renderEngine, imageReferenceId);
            }),
        ).subscribe((containerImages) => {
            const imageMap = new Map();
            for (const image of containerImages) {
                imageMap.set(image.appVersion + ", " + image.rendererVersion, image);
            }
            this.containerImagesMap = imageMap;
            this.allAppVersions = Array.from(new Set(containerImages.map(image => image.appVersion)))
                .sort((a, b) => a.localeCompare(b));
            this.allRendererVersions = Array.from(new Set(containerImages.map(image => image.rendererVersion)))
                .sort((a, b) => a.localeCompare(b));
            this.appVersions = this.allAppVersions;
            this.rendererVersions = this.allRendererVersions;
            this.changeDetector.markForCheck();
        });

        this.appVersionControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value: string) => {
            let containerImage;
            if (value === this.removeSelectionOption) {
                value = "";
                containerImage = "";
                this.appVersionControl.setValue("");
                this.rendererVersions = this.allRendererVersions.concat([this.removeSelectionOption]);
                if (this.rendererVersionControl.value) {
                    this.appVersions = this.allAppVersions.filter(appVersion =>
                        this.containerImagesMap.get(appVersion  + ", " + this.rendererVersionControl.value) != null);
                }
            } else if (value) {
                this.rendererVersions = this.allRendererVersions.filter(rendererVersion =>
                    this.containerImagesMap.get(value  + ", " +  rendererVersion) != null);

                if (!this.appVersions.includes(this.removeSelectionOption)) {
                    this.appVersions = this.appVersions.concat([this.removeSelectionOption]);
                }
                if (this.rendererVersionControl.value) {
                    containerImage = this.containerImagesMap.get(
                        value + ", " +  this.rendererVersionControl.value).containerImage;
                    if (!this.rendererVersions.includes(this.removeSelectionOption)) {
                        this.rendererVersions = this.rendererVersions.concat([this.removeSelectionOption]);
                    }
                }
            }

            if (this._propagateChange) {
                this._propagateChange(containerImage);
            }
            this.containerImage = containerImage;
            this.changeDetector.markForCheck();
        });

        this.rendererVersionControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value: string) => {
            let containerImage;
            if (value === this.removeSelectionOption) {
                value = "";
                containerImage = "";
                this.rendererVersionControl.setValue("");
                this.appVersions = this.allAppVersions.concat([this.removeSelectionOption]);
                if (this.appVersionControl.value) {
                    this.rendererVersions = this.allRendererVersions.filter(rendererVersion =>
                        this.containerImagesMap.get(this.appVersionControl.value  + ", " + rendererVersion) != null);
                }
            } else if (value) {
                this.appVersions = this.allAppVersions.filter(appVersion =>
                    this.containerImagesMap.get(appVersion  + ", " + value) != null);
                if (!this.rendererVersions.includes(this.removeSelectionOption)) {
                    this.rendererVersions = this.rendererVersions.concat([this.removeSelectionOption]);
                }

                if (this.appVersionControl.value) {
                    containerImage = this.containerImagesMap.get(
                        this.appVersionControl.value + ", " + value).containerImage;
                    if (!this.appVersions.includes(this.removeSelectionOption)) {
                        this.appVersions = this.appVersions.concat([this.removeSelectionOption]);
                    }
                }
            }

            if (this._propagateChange) {
                this._propagateChange(containerImage);
            }
            this.containerImage = containerImage;
            this.changeDetector.markForCheck();
        });
    }
    public trackContainerImage(_, rendererVersion: string) {
        return rendererVersion;
    }

    public trackAppVersion(_, appVersion: string) {
        return appVersion;
    }

    public writeValue(containerImageId: any) {
        if (containerImageId) {
            this.renderingContainerImageService.findContainerImageById(containerImageId)
                .subscribe(image => {
                    if (image) {
                        this.appVersionControl.setValue(image.appVersion);
                        this.rendererVersionControl.setValue(image.rendererVersion);
                        this.containerImage = image.containerImage;
                    }
                });
        } else {
            this.appVersionControl.setValue(null);
            this.rendererVersionControl.setValue(null);
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate() {
        return null;
    }

    public ngOnChanges(changes) {
        if (changes.app) {
            this._app.next(this.app);
        }
        if (changes.renderEngine) {
            this._renderEngine.next(this.renderEngine);
        }
        if (changes.imageReferenceId) {
            this._imageReferenceId.next(this.imageReferenceId);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._app.complete();
        this._imageReferenceId.complete();
        this._renderEngine.complete();
    }

    private _upperCaseFirstChar(lower: string) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    }
}
