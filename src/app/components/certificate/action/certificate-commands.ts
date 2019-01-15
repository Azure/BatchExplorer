import { Injectable, Injector } from "@angular/core";
import { ElectronRemote, FileSystemService } from "@batch-flask/electron";
import {
    COMMAND_LABEL_ICON,  EntityCommand,
    EntityCommands,  Permission,
} from "@batch-flask/ui";
import { Certificate, CertificateState } from "app/models";
import { CertificateService, PinnedEntityService } from "app/services";
import { from } from "rxjs";

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
            {
                feature: "certificate.action",
            },
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
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (certificate: Certificate) => this.certificateService.delete(certificate.id),
            enabled: (certificate) => certificate.state !== CertificateState.deleting,
            permission: Permission.Write,
        });

        this.reactivate = this.simpleCommand({
            name: "reactivate",
            ...COMMAND_LABEL_ICON.Reactivate,
            action: (certificate) => this.certificateService.cancelDelete(certificate.id),
            enabled: (certificate) => certificate.state === CertificateState.deletefailed,
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.exportAsJSON = this.simpleCommand({
            name: "exportAsJSON",
            ...COMMAND_LABEL_ICON.ExportAsJSON,
            action: (certificate) => this._exportAsJSON(certificate),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.pin = this.simpleCommand({
            name: "pin",
            label: (certificate: Certificate) => {
                return this.pinnedEntityService.isFavorite(certificate)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteLabel : COMMAND_LABEL_ICON.PinFavoriteLabel;
            },
            icon: (certificate: Certificate) => {
                return this.pinnedEntityService.isFavorite(certificate)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteIcon : COMMAND_LABEL_ICON.PinFavoriteIcon;
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
        if (this.pinnedEntityService.isFavorite(certificate)) {
            return this.pinnedEntityService.unPinFavorite(certificate);
        } else {
            return this.pinnedEntityService.pinFavorite(certificate);
        }
    }

    private _exportAsJSON(certificate: Certificate) {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${certificate.thumbprint}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(certificate._original, null, 2);
            return from(this.fs.saveFile(localPath, content));
        }
    }
}
