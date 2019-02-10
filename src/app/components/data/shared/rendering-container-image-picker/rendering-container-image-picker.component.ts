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
        RenderingContainerImageService,
    ],
})

export class RenderingContainerImagePickerComponent implements ControlValueAccessor, OnChanges, OnDestroy {

    public get appDisplay() {
        return this._upperCaseFirstChar(this.app);
    }

    public get renderEngineDisplay() {
        return this._upperCaseFirstChar(this.renderEngine);
    }

    public appVersionControl = new FormControl();
    public rendererVersionControl = new FormControl();

    public appVersions: string[];
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

    constructor(
        private changeDetector: ChangeDetectorRef,
        private renderingContainerImageService: RenderingContainerImageService) {

        combineLatest(this._app, this._renderEngine, this._imageReferenceId).pipe(
            takeUntil(this._destroy),
            switchMap(([app, renderEngine, imageReferenceId]) => {
                return this.renderingContainerImageService.getAppVersionDisplayList(
                    app, renderEngine, imageReferenceId);
            }),
        ).subscribe((appVersions) => {
            this.appVersions = appVersions;
            this.changeDetector.markForCheck();
        });

        this.rendererVersionControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((containerImage: string) => {
            if (this._propagateChange) {
                this._propagateChange(containerImage);
            }
            this.containerImage = containerImage;
            this.changeDetector.markForCheck();
        });

        combineLatest( this._app, this._renderEngine, this._imageReferenceId, this.appVersionControl.valueChanges).pipe(
            takeUntil(this._destroy),
            switchMap(([app, renderEngine, imageReferenceId, value]) => {
                return this.renderingContainerImageService.getContainerImagesForAppVersion(
                    app, renderEngine, imageReferenceId, value);
            }),
        ).subscribe((containerImages: RenderingContainerImage[]) => {
            this.containerImages = containerImages;
            this.changeDetector.markForCheck();
        });
    }

    public trackContainerImage(_, image: RenderingContainerImage) {
        return image.containerImage;
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
                        this.rendererVersionControl.setValue(image);
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
