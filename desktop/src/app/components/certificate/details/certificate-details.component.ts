import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EntityView, autobind } from "@batch-flask/core";
import { CertificateDecorator } from "app/decorators";
import { Certificate, CertificateState } from "app/models";
import { CertificateParams, CertificateService } from "app/services";
import { Subscription } from "rxjs";
import { CertificateCommands } from "../action";
import {
    CertificateDisplay,
    CertificateDisplayProps
} from "@batch/ui-react/lib/components";

import "./certificate-details.scss";

@Component({
    selector: "bl-certificate-details",
    templateUrl: "certificate-details.html",
    providers: [CertificateCommands],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ thumbprint }) {
        const label = `Certificate - ${thumbprint}`;
        return {
            name: thumbprint,
            label,
            icon: "certificate",
        };
    }

    public certificateThumbprint: string;
    public certificate: Certificate;
    public decorator: CertificateDecorator;
    public data: EntityView<Certificate, CertificateParams>;
    public CertificateState = CertificateState;

    public CertificateDisplay: React.FC<CertificateDisplayProps>;
    public certificateDisplayProps: CertificateDisplayProps;

    private _paramsSubscriber: Subscription;

    constructor(
        public commands: CertificateCommands,
        private activatedRoute: ActivatedRoute,
        private certificateService: CertificateService,
        private router: Router) {

        this.CertificateDisplay = CertificateDisplay;
        this.certificateDisplayProps = {};

        this.data = this.certificateService.view();
        this.data.item.subscribe((certificate) => {
            this.certificate = certificate;
            if (certificate) {
                this.decorator = new CertificateDecorator(certificate);
                this.certificateDisplayProps = {
                    view: certificate as any
                };
            }
        });
        this.data.deleted.subscribe((key) => {
            if (this.certificateThumbprint === key) {
                this.router.navigate(["/certificates"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.certificateThumbprint = params["thumbprint"];
            this.data.params = { thumbprint: this.certificateThumbprint };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }
}
