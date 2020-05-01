import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CertificateDecorator } from "app/decorators";
import { Certificate } from "app/models";

// tslint:disable:template-use-track-by-function
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
