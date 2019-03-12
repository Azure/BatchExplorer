import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { ListView } from "@batch-flask/core";
import { NcjTemplateMode, Pool } from "app/models";
import { RenderApplication, RenderEngine } from "app/models/rendering-container-image";
import { PoolListParams, PoolService, RenderingContainerImageService } from "app/services";
import { BehaviorSubject, Subject, empty } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import "./container-image-on-pool.component.scss";

@Component({
    selector: "bl-container-image-on-pool",
    templateUrl: "container-image-on-pool.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() =>
            ContainerImageOnPoolComponent), multi: true,
        },
    ],
})

export class ContainerImageOnPoolComponent implements ControlValueAccessor, OnChanges, OnDestroy {

    public appVersionControl = new FormControl();
    public rendererVersionControl = new FormControl();

    public containerImage: string;
    public hidden: Boolean = false;

    public poolsData: ListView<Pool, PoolListParams>;

    @Input() public ncjTemplateMode: NcjTemplateMode;
    @Input() public poolContainerImage: string;
    @Input() public poolId: string;
    @Input() public app: RenderApplication;
    @Input() public imageReferenceId: string;
    @Input() public renderEngine: RenderEngine;

    public get appDisplay() {
        return this._upperCaseFirstChar(this.app);
    }

    public get renderEngineDisplay() {
        return this._upperCaseFirstChar(this.renderEngine);
    }

    private _poolContainerImage = new BehaviorSubject(null);
    private _poolId = new BehaviorSubject(null);
    private _ncjTemplateMode = new BehaviorSubject(null);

    private _destroy = new Subject();

    private _propagateChange: (value: string) => void = null;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private poolService: PoolService,
        private renderingContainerImageService: RenderingContainerImageService) {

        this._poolContainerImage.pipe(
            takeUntil(this._destroy),
        ).subscribe(containerImage => {
            this.containerImage = containerImage;
            if (this._propagateChange) {
                this._propagateChange(containerImage);
            }
            this.changeDetector.markForCheck();
        });

        this._poolId.pipe(
            takeUntil(this._destroy),
             switchMap((poolId: string) => {
                if (poolId) {
                    this.poolId = poolId;
                    const pool = this.poolService.get(this.poolId);
                    return pool;
                }
                return empty();
            }),
        ).subscribe((pool) => {
            if (pool) {
                const ciOnPool = pool.virtualMachineConfiguration.containerConfiguration.containerImageNames;
                this.renderingContainerImageService.containerImagesAsMap()
                .subscribe(images => {
                    const matchedImage = ciOnPool.find(imageOnPool => {
                        const image = images.get(imageOnPool);
                        if (image === null) {
                            return false;
                        }
                        if (image.app === this.app
                            && image.renderer === this.renderEngine
                            && image.imageReferenceId === this.imageReferenceId) {
                                this.appVersionControl.setValue(image.appVersion);
                                this.rendererVersionControl.setValue(image.rendererVersion);
                                return true;
                            }
                        return false;
                    });
                    this.containerImage = matchedImage;
                    if (this._propagateChange) {
                        this._propagateChange(matchedImage);
                    }
                });

                this.changeDetector.markForCheck();
            }
        });

        this._ncjTemplateMode.pipe(takeUntil(this._destroy))
            .subscribe((ncjTemplateMode: NcjTemplateMode) => {
                this.ncjTemplateMode = ncjTemplateMode;
                if (ncjTemplateMode === NcjTemplateMode.ExistingPoolAndJob) {
                    this.hidden = false;
                }
                if (ncjTemplateMode === NcjTemplateMode.NewPool) {
                    this.hidden = true;
                }
                if (ncjTemplateMode === NcjTemplateMode.NewPoolAndJob) {
                    this.hidden = true;
                }

                this.changeDetector.markForCheck();
            },
        );
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
        if (changes.poolId) {
            this._poolId.next(this.poolId);
        }
        if (changes.ncjTemplateMode) {
            this._ncjTemplateMode.next(this.ncjTemplateMode);
        }
        if (changes.poolContainerImage) {
            this._poolContainerImage.next(this.poolContainerImage);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._poolId.complete();
        this._poolContainerImage.complete();
        this._ncjTemplateMode.complete();
    }

    private _upperCaseFirstChar(lower: string) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    }
}
