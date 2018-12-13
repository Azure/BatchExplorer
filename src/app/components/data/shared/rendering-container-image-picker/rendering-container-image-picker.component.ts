import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnChanges, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";

import { RenderApplication, RenderEngine, RenderingContainerImage } from "app/models/rendering-container-image";
import { RenderingContainerImageService } from "app/services";
import { Observable, Subscription } from "rxjs";
import { flatMap, map } from "rxjs/operators";
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

export class RenderingContainerImagePickerComponent implements ControlValueAccessor, OnChanges, OnDestroy {

    public appVersionControl = new FormControl();
    public rendererVersionControl = new FormControl();

    public appVersions: string[];
    public containerImages: RenderingContainerImage[];

    public appVersionsData: Observable<string[]>;
    public containerImagesData: Observable<RenderingContainerImage[]>;
    public containerImage: string;

    @Input() public app: string = "maya";
    @Input() public imageReferenceId: string = "centos-75-container";
    @Input() public renderEngine: string = "arnold"; // TODO should be cast and stored
    // as enum type RenderEngine once to validate

    // private _appVersions = new BehaviorSubject<string[]>(null);

    private _propagateChange: (value: string) => void = null;
    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private renderingContainerImageService: RenderingContainerImageService) {

        this._subs.push(this.rendererVersionControl.valueChanges.subscribe((containerImage: string) => {
            if (this._propagateChange) {
                this._propagateChange(containerImage);
            }
            this.containerImage = containerImage;
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.appVersionControl.valueChanges.subscribe((appVersion: string) => {
            this.containerImagesData =
                this.renderingContainerImageService.getContainerImagesForAppVersion(
                RenderApplication[this.app], RenderEngine[this.renderEngine], this.imageReferenceId, appVersion);

            this.containerImagesData.subscribe((containerImages) => {
                this.containerImages = containerImages;
            });

            if (!this.rendererVersionControl.value) {
                const defaultImage = (Array.isArray(this.containerImagesData) &&
                    this.containerImagesData.length > 0) ? this.containerImagesData[0].containerImage : null;
                this.rendererVersionControl.setValue(defaultImage);
            }
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.renderingContainerImageService.loadImageData().pipe(flatMap(() => {
            this.appVersionsData = this.renderingContainerImageService.getAppVersionDisplayList(
                RenderApplication[this.app], this.imageReferenceId);
            return this.appVersionsData;
                })).subscribe((appVersions) => {
            this.appVersions = appVersions;
            }));
    }

    public trackContainerImage(_, image: RenderingContainerImage) {
        return image.containerImage;
    }

    public trackAppVersion(_, image: string) {
       return image;
    }

    public writeValue(containerImageId: string) {
        if (containerImageId) {
            this.renderingContainerImageService.findContainerImageById(containerImageId)
            .pipe(map(image => {
                this.appVersionControl.setValue(image.appVersion);
                this.rendererVersionControl.setValue(image.rendererVersion);
                }));
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
        if (changes) {
            // tslint:disable-next-line:no-console
            console.log("onChange app value:" + this.app);
            // tslint:disable-next-line:no-console
            console.log("onChange imageReferenceId value:" + this.imageReferenceId);
            this.changeDetector.markForCheck();
        }
    }

    public ngOnDestroy() {
        this._subs.forEach(sub => sub.unsubscribe());
    }
}
