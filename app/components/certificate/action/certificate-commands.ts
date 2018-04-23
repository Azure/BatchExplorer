import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { Certificate, CertificateState } from "app/models";
import { CertificateService, PinnedEntityService } from "app/services";

@Injectable()
export class CertificateCommands extends EntityCommands<Certificate> {
    public delete: EntityCommand<Certificate, void>;
    public reactivate: EntityCommand<Certificate, void>;
    public pin: EntityCommand<Certificate, void>;

    constructor(
        injector: Injector,
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
            action: (certificate: Certificate) => this.certificateService.delete(certificate.id),
        });
        this.reactivate = this.simpleCommand({
            label: "Reactivate",
            action: (certificate) => this.certificateService.cancelDelete(certificate.id),
            enabled: (certificate) => certificate.state !== CertificateState.deleting,
            multiple: false,
            confirm: false,
            notify: false,
        });
        this.pin = this.simpleCommand({
            label: (certificate: Certificate) => {
                return this.pinnedEntityService.isFavorite(certificate) ? "Unpin favorite" : "Pin to favorites";
            },
            action: (certificate: Certificate) => this._pinCertificate(certificate),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.delete,
            this.reactivate,
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
}
