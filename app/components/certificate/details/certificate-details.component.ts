import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { ElectronRemote } from "@batch-flask/ui";
import { Observable, Subscription } from "rxjs";

import { Certificate, CertificateState } from "app/models";
import { CertificateDecorator } from "app/models/decorators";
import { CertificateParams, CertificateService, FileSystemService } from "app/services";
import { EntityView } from "app/services/core";
import {
    DeleteCertificateDialogComponent, ReactivateCertificateDialogComponent,
} from "../action";

import "./certificate-details.scss";

@Component({
    selector: "bl-certificate-details",
    templateUrl: "certificate-details.html",
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

    private _paramsSubscriber: Subscription;

    constructor(
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private fs: FileSystemService,
        private remote: ElectronRemote,
        private certificateService: CertificateService,
        private router: Router) {

        this.data = this.certificateService.view();
        this.data.item.subscribe((certificate) => {
            this.certificate = certificate;
            if (certificate) {
                this.decorator = new CertificateDecorator(certificate);
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

    @autobind()
    public deleteCertificate() {
        const config = new MatDialogConfig();
        const dialogRef = this.dialog.open(DeleteCertificateDialogComponent, config);
        dialogRef.componentInstance.certificateThumbprint = this.certificate.thumbprint;
    }

    @autobind()
    public reactivateCertificate() {
        const config = new MatDialogConfig();
        const dialogRef = this.dialog.open(ReactivateCertificateDialogComponent, config);
        dialogRef.componentInstance.certificateThumbprint = this.certificate.thumbprint;
    }

    @autobind()
    public exportAsJSON() {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${this.certificateThumbprint}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(this.certificate._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
    }
}
