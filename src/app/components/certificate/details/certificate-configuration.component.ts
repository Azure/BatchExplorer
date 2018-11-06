import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { Certificate } from "app/models";
import { CertificateDecorator } from "app/models/decorators";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-certificate-configuration",
    templateUrl: "certificate-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateConfigurationComponent {
    @Input()
    public set certificate(certificate: Certificate) {
        this._certificate = certificate;
        this.refresh(certificate);
    }
    public get certificate() { return this._certificate; }

    public decorator: CertificateDecorator = { } as any;

    private _certificate: Certificate;

    public refresh(certificate: Certificate) {
        if (this.certificate) {
            this.decorator = new CertificateDecorator(this.certificate);
        }
    }
}
