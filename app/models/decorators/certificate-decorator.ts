import { Certificate, CertificateState } from "app/models";
import { DeleteCertificateErrorDecorator } from "app/models/decorators";
import { DecoratorBase } from "app/utils/decorators";

export class CertificateDecorator extends DecoratorBase<Certificate> {
    public state: string;
    public stateTransitionTime: string;
    public previousState: string;
    public previousStateTransitionTime: string;
    public stateIcon: string;
    public thumbprintAlgorithm: string;
    public thumbprint: string;
    public publicData: string;
    public url: string;

    public deleteCertificateError: DeleteCertificateErrorDecorator;

    constructor(certificate: Certificate) {
        super(certificate);

        this.state = this.stateField(certificate.state);
        this.stateTransitionTime = this.dateField(certificate.stateTransitionTime);
        this.stateIcon = this._getStateIcon(certificate.state);
        this.previousState = this.stateField(certificate.previousState);
        this.previousStateTransitionTime = this.dateField(certificate.previousStateTransitionTime);
        this.url = this.stringField(certificate.url);
        this.thumbprintAlgorithm = this.stringField(certificate.thumbprintAlgorithm);
        this.thumbprint = this.stringField(certificate.thumbprint);
        this.publicData = this.stringField(certificate.publicData);
        this.deleteCertificateError = new DeleteCertificateErrorDecorator(
            certificate.deleteCertificateError || {} as any);
    }

    private _getStateIcon(state: CertificateState): string {
        switch (state) {
            case CertificateState.active:
                return "fa-cog";
            case CertificateState.deleting:
            case CertificateState.deletefailed:
                return "fa-ban";
            default:
                return "fa-question-circle-o";
        }
    }
}
