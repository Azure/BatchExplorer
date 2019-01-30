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
import { PoolListParams, PoolService, RenderingContainerImageService } from "app/services";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";

import { ListView } from "@batch-flask/core";
import { Pool } from "app/models";
import "./container-image-on-pool.scss";

@Component({
    selector: "bl-container-image-on-pool",
    templateUrl: "container-image-on-pool.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() =>
            ContainerImageOnPoolComponent), multi: true,
        },
        RenderingContainerImageService,
    ],
})

export class ContainerImageOnPoolComponent implements ControlValueAccessor, OnChanges, OnDestroy {

    public containerImage: string;

    public poolsData: ListView<Pool, PoolListParams>;

    @Input() public poolId: string;

    private _propagateChange: (value: string) => void = null;

    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private poolService: PoolService) {

        this.poolsData = this.poolService.listView();

        this._subs.push(this.poolsData.items.subscribe((pools) => {
            this._pools = pools;
            this._updateOffers();
            this._updateDisplayedPools();
        }));
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
