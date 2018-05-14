import { Injectable, Injector } from "@angular/core";
import { ElectronRemote, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";

import { Certificate, CertificateState } from "app/models";
import { CertificateService, FileSystemService, PinnedEntityService } from "app/services";
import { Observable } from "rxjs/Observable";

@Injectable()
export class CertificateCommands extends EntityCommands<Certificate> {
    public delete: EntityCommand<Certificate, void>;
    public reactivate: EntityCommand<Certificate, void>;
    public exportAsJSON: EntityCommand<Certificate, void>;
    public pin: EntityCommand<Certificate, void>;

    constructor(
        injector: Injector,
        private fs: FileSystemService,
        private remote: ElectronRemote,
        private certificateService: CertificateService,
        private pinnedEntityService: PinnedEntityService) {
        super(
            injector,
            "Certificate",
        );

        this._buildCommands();
    }

    public get(certificateId: string) {
        return this.certificateService.get(certificateId);
    }

    public getFromCache(certificateId: string) {
        return this.certificateService.getFromCache(certificateId);
    }

    private _buildCommands() {
        this.delete = this.simpleCommand({
            label: "Delete",
            icon: "fa fa-trash-o",
            action: (certificate: Certificate) => this.certificateService.delete(certificate.id),
            enabled: (certificate) => certificate.state !== CertificateState.deleting,
            permission: Permission.Write,
        });

        this.reactivate = this.simpleCommand({
            label: "Reactivate",
            icon: "fa fa-undo",
            action: (certificate) => this.certificateService.cancelDelete(certificate.id),
            enabled: (certificate) => certificate.state === CertificateState.deletefailed,
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.exportAsJSON = this.simpleCommand({
            label: "Export as JSON",
            icon: "fa fa-code",
            action: (certificate) => this._exportAsJSON(certificate),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.pin = this.simpleCommand({
            label: (certificate: Certificate) => {
                return this.pinnedEntityService.isFavorite(certificate) ? "Unpin favorite" : "Pin to favorites";
            },
            icon: (certificate: Certificate) => {
                return this.pinnedEntityService.isFavorite(certificate) ? "fa fa-chain-broken" : "fa fa-link";
            },
            action: (certificate: Certificate) => this._pinCertificate(certificate),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.delete,
            this.reactivate,
            this.exportAsJSON,
            this.pin,
        ];
    }

    private _pinCertificate(certificate: Certificate) {
        this.pinnedEntityService.pinFavorite(certificate).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(certificate);
            }
        });
    }

    private _exportAsJSON(certificate: Certificate) {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${certificate.thumbprint}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(certificate._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
    }
}
