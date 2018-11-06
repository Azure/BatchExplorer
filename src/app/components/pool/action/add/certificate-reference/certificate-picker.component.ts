import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { autobind } from "@batch-flask/core";
import { Certificate } from "app/models";
import { defaultThumbprintAlgorithm } from "app/services";

import "./certificate-picker.scss";

export enum CertificateVisibility {
    StartTask = "StartTask",
    Task = "Task",
    RemoteUser = "RemoteUser",
}

export enum CertificateStoreLocation {
    CurrentUser = "CurrentUser",
    LocalMachine = "LocalMachine",
}

export enum CommonStoreName {
    My = "My",
    Root = "Root",
    CA = "CA",
    Trust = "Trust",
    Disallowed = "Disallowed",
    TrustedPeople = "TrustedPeople",
    TrustedPublisher  = "TrustedPublisher",
    AuthRoot = "AuthRoot",
    AddressBook = "AddressBook",
}

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
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CertificatePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CertificatePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatePickerComponent implements OnChanges, ControlValueAccessor, Validator, OnDestroy {
    @Input() public osType: "linux" | "windows";
    @Input() public certificates: Certificate[] = [];
    @Input() public currentCertificates: Certificate[] = [];
    public form: FormGroup;
    public linuxStoreLocationMessage = `For Linux compute nodes, the certificates are stored in a `
        + `directory inside the task working directory and an environment variable  AZ_BATCH_CERTIFICATES_DIR `
        + `is supplied to the task to query for this location. For certificates with visibility of "remoteUser", `
        + `a "certs" directory is created in the user's home directory (e.g., /home/\{user-name\}/certs) `
        + `and certificates are placed in that directory.`;

    private _propagateChange: (value: CertificateReference) => void = null;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder,
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
        this._setThumbprintValidator(value);
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

    public trackByCertificate(index, certificate: Certificate) {
        return certificate.thumbprint;
    }

    public trackByIndex(index, certificate: any) {
        return index;
    }

    public get isWindows() {
        return this.osType === "windows";
    }

    public get commonStoreNames() {
        return Object.keys(CommonStoreName).map(storeName => storeName.toString());
    }

    public get storeLocations() {
        return Object.keys(CertificateStoreLocation).map(loc => loc.toString());
    }

    public get visibilities() {
        return Object.keys(CertificateVisibility).map(visibility => visibility.toString());
    }

    @autobind()
    private _thumbprintValidator(certificates: Certificate[]) {
        return (control: FormControl): {[key: string]: any} => {
            if (control.value === null) {
                return null;
            }
            let hasDuplicate = false;
            if (certificates) {
                for (const certificate of certificates) {
                    if (control.value === certificate.thumbprint) {
                        hasDuplicate = true;
                        break;
                    }
                }
            }
            return hasDuplicate ? {
                duplicateValue: {
                    value: control.value,
                },
            } : null;
        };
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

    private _setThumbprintValidator(value: CertificateReference) {
        const currentCertificates = value ?
            this.currentCertificates.filter(cert => cert.thumbprint !== value.thumbprint) : this.currentCertificates;
        const validators = [
            Validators.required,
            this._thumbprintValidator(currentCertificates),
        ];
        this.form.get("thumbprint").setValidators(validators);
    }
}
