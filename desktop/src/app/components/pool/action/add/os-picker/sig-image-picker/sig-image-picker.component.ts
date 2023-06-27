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
import { ArmBatchAccount, ImageInformation, Resource } from "app/models";
import { BatchAccountService, ComputeService, PoolOsService } from "app/services";
import { Subject, of } from "rxjs";
import { distinctUntilChanged, switchMap, takeUntil } from "rxjs/operators";

import "./sig-image-picker.scss";

export interface SigImageSelection {
    imageId: string;
    nodeAgentSku: string;
}

let idCounter = 0;

@Component({
    selector: "bl-sig-image-picker",
    templateUrl: "sig-image-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SigImagePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => SigImagePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SigImagePickerComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
    @Input() public id = `bl-sig-image-picker-${idCounter++}`;

    public sigImages: Resource[] = [];
    public supportedImages: ImageInformation[] = [];

    public sigImage = new FormControl();
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
            sigImage: this.sigImage,
            nodeAgentSku: this.nodeAgentSku,
        });
        this._form.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
        ).subscribe(({ sigImage, nodeAgentSku }) => {
            if (sigImage || nodeAgentSku) {
                this._propagateChange({
                    imageId: sigImage,
                    nodeAgentSku,
                });
            } else {
                this._propagateChange(null);
            }
            this.changeDetector.markForCheck();
        });

    }

    public ngOnInit() {
        this.poolOsService.supportedImages.pipe(
            takeUntil(this._destroy),
        ).subscribe((result) => {
            this.supportedImages = result.toArray();
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
                const sigImages = this.computeService.listSIG(subscriptionId, location);
                return sigImages;
            }),
        ).subscribe({
            next: (resources) => {
                this.sigImages = resources;
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

    public writeValue(value: SigImageSelection | null): void {
        // Write
        const formValue = this._form.value;
        if (value) {
            if (formValue.sigImage === value.imageId && formValue.nodeAgentSku === value.nodeAgentSku) {
                return;
            }
            this._form.patchValue({
                sigImage: value.imageId,
                nodeAgentSku: value.nodeAgentSku,
            });
        } else {
            if (formValue.sigImage || formValue.nodeAgentSku) {
                this._form.patchValue({
                    sigImage: null,
                    nodeAgentSku: null,
                });
            }
        }
    }

    public registerOnChange(fn: (result: SigImageSelection | null) => void): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        //    nothing
    }

    private _propagateChange: (result: SigImageSelection | null) => void = () => null;
}
