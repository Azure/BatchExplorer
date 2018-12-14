import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, Pipe, PipeTransform, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { Certificate, CertificateReferenceAttributes, OSType } from "app/models";
import { CertificateService } from "app/services";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Pipe({
    name: "trimThumbprint",
    pure: true,
})
export class I18nPipe implements PipeTransform {
    public transform(thumbprint: string) {
        if (!thumbprint) {
            return null;
        }
        const length = 15;
        return thumbprint.length > length ? thumbprint.substring(0, length) + "..." : thumbprint;
    }
}

@Component({
    selector: "bl-certificate-references",
    templateUrl: "certificate-references.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        I18nPipe,
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CertificateReferencesComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CertificateReferencesComponent), multi: true },
    ],
})
export class CertificateReferencesComponent implements OnDestroy, ControlValueAccessor, Validator {

    @Input() public osType: OSType;

    public certificates: Certificate[] = [];

    public references = new FormControl<CertificateReferenceAttributes[]>([], this._duplicateValidator);
    public _propagateChange: (value: CertificateReferenceAttributes[]) => void;

    private _destroy = new Subject();

    constructor(
        private certificateService: CertificateService,
        private changeDetector: ChangeDetectorRef) {

        this.certificateService.listAll().subscribe((certificates) => {
            this.certificates = certificates.toArray();
            this.changeDetector.markForCheck();
        });

        this.references.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public validate(c: FormControl): ValidationErrors | null {
        if (this.references.valid) {
            return null;
        } else {
            return {
                invalid: true,
            };
        }
    }

    public writeValue(obj: CertificateReferenceAttributes[] | null): void {
        if (obj) {
            this.references.setValue(obj, { emitEvent: false });
        } else {
            this.references.setValue([]);
        }
    }

    public registerOnChange(fn: any): void {
        // Nothing
    }

    public registerOnTouched(fn: (value: CertificateReferenceAttributes[]) => void): void {
        this._propagateChange = fn;
    }

    @autobind()
    private _duplicateValidator(control: FormControl<CertificateReferenceAttributes[]>): ValidationErrors | null {
        if (control.value === null) {
            return null;
        }
        let duplicate: string | null = null;
        const certificates = control.value;
        const thumprints = new Set<string>();

        if (certificates) {
            for (const certificate of certificates) {
                if (thumprints.has(certificate.thumbprint)) {
                    duplicate = certificate.thumbprint;
                    break;
                }
                thumprints.add(certificate.thumbprint);
            }
        }
        return duplicate ? {
            duplicate: {
                value: duplicate,
            },
        } : null;
    }

}
