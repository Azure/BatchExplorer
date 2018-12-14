import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators,
} from "@angular/forms";
import { Certificate, CertificateStoreLocation, CertificateVisibility, CommonStoreName, OSType } from "app/models";
import { defaultThumbprintAlgorithm } from "app/services";
import { Subscription } from "rxjs";

import "./certificate-picker.scss";

export interface CertificateReference {
    thumbprint: string;
    thumbprintAlgorithm: string;
    storeName: string;
    storeLocation: CertificateStoreLocation;
    visibility: CertificateVisibility[];
}

const defaultVisibility = [
    CertificateVisibility.StartTask,
    CertificateVisibility.Task,
    CertificateVisibility.RemoteUser,
];

@Component({
    selector: "bl-certificate-picker",
    templateUrl: "certificate-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CertificatePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CertificatePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatePickerComponent implements OnChanges, ControlValueAccessor, Validator, OnDestroy {

    public get isWindows() {
        return this.osType === OSType.Windows;
    }
    @Input() public osType: "linux" | "windows";
    @Input() public certificates: Certificate[] = [];
    @Input() public currentCertificates: Certificate[] = [];

    public form: FormGroup;
    public linuxStoreLocationMessage = `For Linux compute nodes, the certificates are stored in a `
        + `directory inside the task working directory and an environment variable  AZ_BATCH_CERTIFICATES_DIR `
        + `is supplied to the task to query for this location. For certificates with visibility of "remoteUser", `
        + `a "certs" directory is created in the user's home directory (e.g., /home/\{user-name\}/certs) `
        + `and certificates are placed in that directory.`;

    public readonly commonStoreNames: string[] = Object.keys(CommonStoreName);
    public readonly storeLocations: string[] = Object.keys(CertificateStoreLocation);
    public readonly visibilities: string[] = Object.keys(CertificateVisibility);

    private _propagateChange: (value: CertificateReference) => void = null;
    private _sub: Subscription;

    constructor(
        formBuilder: FormBuilder,
        private changeDetector: ChangeDetectorRef) {

        this.form = formBuilder.group({
            thumbprint: ["", Validators.required],
            thumbprintAlgorithm: [defaultThumbprintAlgorithm],
            storeName: [CommonStoreName.My],
            storeLocation: [CertificateStoreLocation.CurrentUser],
            visibility: [defaultVisibility, Validators.required],
        });

        this._sub = this.form.valueChanges.subscribe((value: any) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnChanges(inputs) {
        if (inputs.osType) {
            this._setOptionalForm();
        }
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: CertificateReference) {
        if (value) {
            this.form.patchValue(value);
        } else {
            this.form.reset({
                thumbprintAlgorithm: defaultThumbprintAlgorithm,
                thumbprint: null,
                visibility: defaultVisibility,
                storeName: null,
                storeLocation: null,
            });
            this._setOptionalForm();
        }
        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (!valid) {
            return {
                certificateReference: {
                    valid: false,
                },
            };
        }
        return null;
    }

    public trackByCertificate(_, certificate: Certificate) {
        return certificate.thumbprint;
    }

    public trackByValue(_, value: any) {
        return value;
    }

    private _setOptionalForm() {
        // if osType is windows, reset the value storeName and storeLocation value to default
        // and added required validation vice versa
        let validators = [];
        let storeNameValue = null;
        let storeLocationValue = null;
        if (this.isWindows) {
            validators = [Validators.required];
            storeNameValue = CommonStoreName.My;
            storeLocationValue = CertificateStoreLocation.CurrentUser;
        }
        const storeName = this.form.get("storeName");
        const storeLocation = this.form.get("storeLocation");
        storeName.setValidators(validators);
        storeName.setValue(storeNameValue);
        storeLocation.setValidators(validators);
        storeLocation.setValue(storeLocationValue);
    }
}
