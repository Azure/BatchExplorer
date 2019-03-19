import { Component, Input } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { FileUrlUtils } from "@batch-flask/utils";
import { CertificateFormat, CertificateService } from "app/services";
import { Constants } from "common";
import { Observable } from "rxjs";

import "./add-certificate-form.scss";

let idCounter = 0;

@Component({
    selector: "bl-add-certificate-form",
    templateUrl: "add-certificate-form.html",
})
export class AddCertificateFormComponent {
    @Input() public id = `bl-add-certificate-form-${idCounter++}`;

    public file: File;
    public form: FormGroup;
    public title = "Add certificate";

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<AddCertificateFormComponent>,
        private certificateService: CertificateService,
        private notificationService: NotificationService) {
        const validation = Constants.forms.validation;

        this.form = this.formBuilder.group({
            certificate: ["", [
                Validators.required,
                Validators.pattern(validation.regex.certificateFileName),
            ]],
            password: [null, this._passwordValidator()],
        });
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.form.value;
        const obs = this.certificateService.parseCertificate(this.file, formData.password);

        obs.subscribe({
            next: (certificate: any) => {
                const obs = this.certificateService.add(certificate);
                obs.subscribe({
                    next: () => {
                        this.certificateService.onCertificateAdded.next(certificate.thumbprint);
                        this.notificationService.success("Certificate added!",
                            `Certificate '${certificate.thumbprint}' was created successfully!`);
                    },
                    error: () => null,
                });
            },
            error: (response: Response) => {
                this.notificationService.error(
                    "Certificate creation failed",
                    response.toString(),
                );
            },
        });
        return obs;
    }

    public fileSelected(changeEvent: Event) {
        const element = changeEvent.srcElement as any;
        this.form.controls["certificate"].markAsTouched();
        if (element.files.length > 0) {
            this.file = element.files[0];
            this.form.controls["certificate"].setValue(this.file.name);
        } else {
            this.file = null;
            this.form.controls["certificate"].setValue(null);
        }
        this.form.controls["password"].setValue(null);
    }

    public get showPassword() {
        return this.file && FileUrlUtils.getFileExtension(this.file.name) === CertificateFormat.pfx;
    }

    private _passwordValidator() {
        return (control: FormControl): { [key: string]: any } => {
            if (this.showPassword) {
                if (!control.value) {
                    return {
                        pfxPasswordRequired: {
                            value: true,
                        },
                    };
                }
            }
            return null;
        };
    }
}
