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

        this.appVersionControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((appVersion: string) => {
            const rendererVersion = this.rendererVersionControl.value;
            if (appVersion === this.removeSelectionOption) {
                this.containerImage = "";
                this.appVersionControl.setValue("");
                this.rendererVersions = this.ensureArrayIncludesRemoveOption(this.allRendererVersions);
                if (rendererVersion) {
                    this.appVersions = this.allAppVersions.filter(appVersion =>
                        this.containerImagesMapContains(appVersion, rendererVersion));
                }
            } else if (appVersion) {
                this.rendererVersions = this.allRendererVersions.filter(rendererVersion =>
                    this.containerImagesMapContains(appVersion, rendererVersion));

                this.appVersions = this.ensureArrayIncludesRemoveOption(this.appVersions);

                if (rendererVersion) {
                    this.containerImage = this.getFromContainerImagesMap(appVersion, rendererVersion)
                        .containerImage;
                    this.rendererVersions = this.ensureArrayIncludesRemoveOption(this.rendererVersions);
                }
            }

            if (this._propagateChange) {
                this._propagateChange(this.containerImage);
            }
            this.changeDetector.markForCheck();
        });

        this.rendererVersionControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((rendererVersion: string) => {
            const appVersion = this.appVersionControl.value;
            if (rendererVersion === this.removeSelectionOption) {
                this.containerImage = "";
                this.rendererVersionControl.setValue("");
                this.appVersions = this.ensureArrayIncludesRemoveOption(this.allAppVersions);
                if (appVersion) {
                    this.rendererVersions = this.allRendererVersions.filter(rendererVersion =>
                        this.containerImagesMapContains(appVersion, rendererVersion));
                }
            } else if (rendererVersion) {
                this.appVersions = this.allAppVersions.filter(appVersion =>
                    this.containerImagesMapContains(appVersion, rendererVersion));
                this.rendererVersions = this.ensureArrayIncludesRemoveOption(this.rendererVersions);

                if (appVersion) {

                    this.containerImage = this.getFromContainerImagesMap(appVersion, rendererVersion)
                        .containerImage;
                    this.appVersions = this.ensureArrayIncludesRemoveOption(this.appVersions);
                }
            }

            if (this._propagateChange) {
                this._propagateChange(this.containerImage);
            }
            this.changeDetector.markForCheck();
        });
    }

    public ensureArrayIncludesRemoveOption(options: string[]): string[] {
        if (!options.includes(this.removeSelectionOption)) {
            options = options.concat([this.removeSelectionOption]);
        }
        return options;
    }

    public getFromContainerImagesMap(appVersion: string, rendererVersion: string): RenderingContainerImage {
        return this.containerImagesMap.get(this.buildImagesMapKey(appVersion, rendererVersion));
    }

    public containerImagesMapContains(appVersion: string, rendererVersion: string): boolean {
        const found = this.getFromContainerImagesMap(appVersion, rendererVersion) != null;
        return found;
    }

    public buildImagesMapKey(appVersion: string, rendererVersion: string): string {
        return appVersion  + ", " + rendererVersion;
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
