import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Observable } from "rxjs";

import { DynamicForm, autobind } from "@batch-flask/core";
import { ComplexFormConfig } from "@batch-flask/ui/form";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { Certificate } from "app/models";
import { CertificateCreateDto } from "app/models/dtos";
import { certificateToFormModel, createCertificateFormToJsonData } from "app/models/forms";
import { CertificateService } from "app/services";
import { Constants } from "app/utils";

import "./certificate-create-basic-dialog.scss";

@Component({
    selector: "bl-certificate-create-basic-dialog",
    templateUrl: "certificate-create-basic-dialog.html",
})
export class CertificateCreateBasicDialogComponent extends DynamicForm<Certificate, CertificateCreateDto> {
    public complexFormConfig: ComplexFormConfig;
    public file: File;
    public fileUri = "create.certificate.batch.json";

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<CertificateCreateBasicDialogComponent>,
        private certificateService: CertificateService,
        private notificationService: NotificationService) {
        super(CertificateCreateDto);
        this._setComplexFormConfig();
        const validation = Constants.forms.validation;

        this.form = this.formBuilder.group({
            certificateFormat: [null],
            data: [null],
            password: [null],
            thumbprint: [null],
            thumbprintAlgorithm: [null],
            certificate: ["", [
                Validators.required,
                Validators.pattern(validation.regex.certificateFileName),
            ]],
        });
    }

    public dtoToForm(certificate: CertificateCreateDto) {
        return certificateToFormModel(certificate);
    }

    public formToDto(data: any): CertificateCreateDto {
        return createCertificateFormToJsonData(data);
    }

    @autobind()
    public submit(data: CertificateCreateDto): Observable<any> {
        const thumbprint = data.thumbprint;
        const obs = this.certificateService.add(data);
        obs.subscribe({
            next: () => {
                this.certificateService.onCertificateAdded.next(thumbprint);
                this.notificationService.success("Certificate added!",
                    `Certificate '${thumbprint}' was created successfully!`);
            },
            error: () => null,
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
    }

    private _setComplexFormConfig() {
        this.complexFormConfig = {
            jsonEditor: {
                dtoType: CertificateCreateDto,
                toDto: (value) => this.formToDto(value),
                fromDto: (value) => this.dtoToForm(value),
            },
        };
    }
}
