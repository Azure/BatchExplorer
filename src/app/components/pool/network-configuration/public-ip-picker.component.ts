import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    forwardRef,
} from "@angular/core";
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
} from "@angular/forms";
import { ListView, LoadingStatus, ServerError } from "@batch-flask/core";
import { ArmBatchAccount, BatchApplication } from "app/models";
import { PublicIP } from "app/models/public-ip";
import {
    ApplicationListParams,
    BatchAccountService,
    NetworkConfigurationService,
} from "app/services";
import { Subject, of } from "rxjs";
import {
    distinctUntilChanged,
    switchMap,
    takeUntil,
} from "rxjs/operators";

import "./public-ip-picker.scss";

@Component({
    selector: "bl-public-ip-picker",
    templateUrl: "public-ip-picker.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PublicIPPickerComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => PublicIPPickerComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicIPPickerComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
    public publicIPs: PublicIP[];
    public LoadingStatus = LoadingStatus;
    public loadingStatus = LoadingStatus.Loading;

    public errorMessage: string;
    public _propagateChange: (ips: PublicIP[]) => void;
    public ipAddresses = new FormControl<PublicIP[]>([]);

    private data: ListView<BatchApplication, ApplicationListParams>;
    private _destroy = new Subject();

    constructor(
        private networkConfigurationService: NetworkConfigurationService,
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.ipAddresses.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
        ).subscribe((publicIP) => {
            if (this._propagateChange) {
                this._propagateChange(publicIP);
            }
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            switchMap((account) => {
                if (!(account instanceof ArmBatchAccount)) { return of([]); }
                const subscriptionId = account && account.subscription && account.subscription.subscriptionId;
                const location = account.location;
                if (!subscriptionId || !location) {
                    return of([]);
                }
                return this.networkConfigurationService.listPublicIPs(subscriptionId, location);
            }),
        ).subscribe({
            next: (resources: PublicIP[]) => {
                console.log(resources.length);
                resources.forEach(element => {
                    console.log(element);
                });
                this.publicIPs = resources;
                this.loadingStatus = LoadingStatus.Ready;
                this.changeDetector.markForCheck();
            },
            error: (error: ServerError) => {
                this.loadingStatus = LoadingStatus.Error;
                this.errorMessage = error ? `${error.code}: ${error.message}`
                    : "Server encountered an error loading public IPs, please try again later.";
            },
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public writeValue(publicIPs: PublicIP[]) {
        this.ipAddresses.setValue(publicIPs);
    }

    public registerOnChange(fn: (ips: PublicIP[]) => void) {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: () => void) {
        // Nothing to do
    }

    public validate(control: AbstractControl): ValidationErrors {
        return null;
    }
}
