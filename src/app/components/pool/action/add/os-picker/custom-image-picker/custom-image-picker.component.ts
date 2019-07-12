import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormControl, FormGroup,
    NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { ServerError } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui";
import { ArmBatchAccount, NodeAgentSku, Resource } from "app/models";
import { BatchAccountService, ComputeService, PoolOsService } from "app/services";
import { Subject, forkJoin, of } from "rxjs";
import { concat, distinctUntilChanged, switchMap, takeUntil } from "rxjs/operators";

import "./custom-image-picker.scss";

export interface CustomImageSelection {
    imageId: string;
    nodeAgentSku: string;
}

let idCounter = 0;

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
    public nodeAgentSkus: NodeAgentSku[] = [];

    public customImage = new FormControl();
    public nodeAgentSku = new FormControl();

    public LoadingStatus = LoadingStatus;
    public loadingStatus = LoadingStatus.Loading;

    public errorMessage: string;

    private _destroy = new Subject();
    private _form: FormGroup;

    constructor(
        private accountService: BatchAccountService,
        private computeService: ComputeService,
        private poolOsService: PoolOsService,
        private changeDetector: ChangeDetectorRef) {

        this._form = new FormGroup({
            customImage: this.customImage,
            nodeAgentSku: this.nodeAgentSku,
        });
        this._form.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
        ).subscribe(({ customImage, nodeAgentSku }) => {
            if (customImage || nodeAgentSku) {
                this._propagateChange({
                    imageId: customImage,
                    nodeAgentSku,
                });
            } else {
                this._propagateChange(null);
            }
            this.changeDetector.markForCheck();
        });

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
                if (!(account instanceof ArmBatchAccount)) { return of([]); }
                const subscriptionId = account && account.subscription && account.subscription.subscriptionId;
                const location = account.location;
                if (!subscriptionId || !location) {
                    return of([]);
                }
                const customImages = this.computeService.listCustomImages(subscriptionId, location);
                const sigImages = this.computeService.listSIG(subscriptionId, location);
                return forkJoin(customImages, sigImages, (images, sigVersions) => [...images, ...sigVersions]);
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

    public writeValue(value: CustomImageSelection | null): void {
        // Write
        const formValue = this._form.value;
        if (value) {

            if (formValue.customImage === value.imageId && formValue.nodeAgentSku === value.nodeAgentSku) {
                return;
            }
            this._form.patchValue({
                customImage: value.imageId,
                nodeAgentSku: value.nodeAgentSku,
            });
        } else {
            if (formValue.customImage || formValue.nodeAgentSkus) {
                this._form.patchValue({
                    customImage: null,
                    nodeAgentSku: null,
                });
            }
        }
    }

    public registerOnChange(fn: (result: CustomImageSelection | null) => void): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        //    nothing
    }

    private _propagateChange: (result: CustomImageSelection | null) => void = () => null;
}
