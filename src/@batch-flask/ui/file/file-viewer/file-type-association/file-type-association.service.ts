import { Injectable, OnDestroy } from "@angular/core";
import { log } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { BatchFlaskSettingsService } from "src/@batch-flask/ui/batch-flask-settings";
import { DEFAULT_FILE_ASSOCIATIONS } from "./default-associations";

interface FileAssociation {
    extension?: string;
    type: string;
}

@Injectable()
export class FileTypeAssociationService implements OnDestroy {
    private _associations: FileAssociation[] = [];
    private _settingsSub: Subscription;

    constructor(settingsService: BatchFlaskSettingsService) {
        this._settingsSub = settingsService.settingsObs.subscribe((settings) => {
            this._associations = [];
            this._registerAssociations(DEFAULT_FILE_ASSOCIATIONS);
            this._registerAssociations(settings.fileAssociations);
        });
    }

    public ngOnDestroy() {
        this._settingsSub.unsubscribe();
    }

    public getType(filename: string) {
        let extensionMatch: FileAssociation;

        for (let i = this._associations.length - 1; i >= 0; i--) {
            const association = this._associations[i];

            if (association.extension) {
                // Longest extension match
                if (!extensionMatch || association.extension.length > extensionMatch.extension.length) {
                    if (filename.endsWith(association.extension)) {
                        extensionMatch = association;
                    }
                }
            }
        }
    }

    private _registerAssociations(fileAssociations: StringMap<string>) {
        for (const [extension, type] of Object.entries(fileAssociations)) {
            if (!type || !extension) {
                log.error(`Trying to register an invalid file association ${extension}, ${type}`);
                continue;
            }
            this._associations.push({ extension: extension.toLowerCase(), type });
        }
    }
}
