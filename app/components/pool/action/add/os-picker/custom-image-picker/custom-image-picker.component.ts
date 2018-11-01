import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { ServerError } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui";
import { ArmBatchAccount, NodeAgentSku, Resource } from "app/models";
import { BatchAccountService, ComputeService, PoolOsService } from "app/services";
import { Subject, of } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import "./custom-image-picker.scss";

let idCounter;

@Component({
    selector: "bl-custom-image-picker",
    templateUrl: "custom-image-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomImagePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CustomImagePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomImagePickerComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
    @Input() public id = `bl-custom-image-picker-${idCounter++}`;

    public customImages: Resource[] = [];
    public nodeAgentSkus: NodeAgentSku[];

    public customImage = new FormControl();
    public nodeAgentSku = new FormControl();

    public LoadingStatus = LoadingStatus;
    public loadingStatus = LoadingStatus.Loading;

    public errorMessage: string;

    private _propagateChange: (imageId: string) => void;
    private _destroy = new Subject();

    constructor(
        private accountService: BatchAccountService,
        private computeService: ComputeService,
        private poolOsService: PoolOsService,
        private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this.poolOsService.nodeAgentSkus.pipe(
            takeUntil(this._destroy),
        ).subscribe((result) => {
            this.nodeAgentSkus = result.toArray();
            this.changeDetector.markForCheck();
        });

        this.accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            switchMap((account) => {
                if (!(account instanceof ArmBatchAccount)) { return of(null); }
                const subscriptionId = account && account.subscription && account.subscription.subscriptionId;
                const location = account.location;
                if (!subscriptionId || !location) {
                    return of(null);
                }

                return this.computeService.listCustomImages(subscriptionId, location);
            }),
        ).subscribe({
            next: (resources) => {
                this.customImages = resources;
                this.loadingStatus = LoadingStatus.Ready;
                this.changeDetector.markForCheck();
            },
            error: (error: ServerError) => {
                this.loadingStatus = LoadingStatus.Error;
                this.errorMessage = error ? `${error.code}: ${error.message}`
                    : "Server encountered an error loading custom images, please try again later.";
            },
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public validate(control: AbstractControl): ValidationErrors {
        return null;
    }

    public writeValue(imageId: string): void {
        // Write
        this._propagateChange(imageId);
    }

    public registerOnChange(fn: (imageId: string) => void): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        //    nothing
    }

    // if (!this.hasCustomImage) {
    //     return;
    // }
    // this.value = {
    //     source: PoolOsSources.IaaS,
    //     virtualMachineConfiguration: {
    //         nodeAgentSKUId: this.nodeAgentSku.value,
    //         imageReference: {
    //             virtualMachineImageId: this.customImage.value,
    //         },
    //     },
    //     cloudServiceConfiguration: null,
    // };
    // this._updateSelection();
    // if (this._propagateChange) {
    //     this._propagateChange(this.value);
    // }
}
