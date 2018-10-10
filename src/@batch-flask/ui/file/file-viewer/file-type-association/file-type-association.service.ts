import { Injectable, OnDestroy, Type } from "@angular/core";
import { BatchFlaskSettingsService } from "@batch-flask/ui/batch-flask-settings";
import { log } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { CodeFileViewerComponent } from "../code-file-viewer";
import { FileViewer } from "../file-viewer";
import { ImageFileViewerComponent } from "../image-file-viewer";
import { LogFileViewerComponent } from "../log-file-viewer";
import { DEFAULT_FILE_ASSOCIATIONS } from "./default-associations";

interface FileAssociation {
    extension?: string;
    type: string;
}

export type FileViewerType = typeof FileViewer & Type<FileViewer>;

export const FILE_TYPE_COMPONENTS = {
    log: LogFileViewerComponent,
    code: CodeFileViewerComponent,
    image: ImageFileViewerComponent,
};

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

    public getComponentType(fileType: string): FileViewerType {
        return FILE_TYPE_COMPONENTS[fileType] as any;
    }
    public getType(filename: string): string {
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
        return extensionMatch && extensionMatch.type;
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
