import { Injectable, OnDestroy, Type } from "@angular/core";
import { BatchFlaskSettingsService } from "@batch-flask/ui/batch-flask-settings";
import { log } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { FileViewer } from "../file-viewer";
import { ImageFileViewerComponent } from "../image-file-viewer";
import { LogFileViewerComponent } from "../log-file-viewer";
import { TextFileViewerComponent } from "../text-file-viewer";
import { DEFAULT_FILE_ASSOCIATIONS } from "./default-associations";

interface FileAssociation {
    extension?: string;
    type: string;
}

export type FileViewerType = typeof FileViewer & Type<FileViewer>;

export interface ViewerRegistration {
    name: string;
    component: Type<FileViewer>;
    extensions?: string[];
}

@Injectable()
export class FileTypeAssociationService implements OnDestroy {
    private _associations: FileAssociation[] = [];
    private _settingsSub: Subscription;
    private _viewers = new Map<string, FileViewerType>();
    private _viewersFileAssociations: StringMap<string> = {};

    constructor(settingsService: BatchFlaskSettingsService) {
        this.registerViewer({ name: "text", component: TextFileViewerComponent });
        this.registerViewer({ name: "log", component: LogFileViewerComponent });
        this.registerViewer({ name: "image", component: ImageFileViewerComponent });

        this._settingsSub = settingsService.settingsObs.subscribe((settings) => {
            this._associations = [];
            this._registerAssociations(DEFAULT_FILE_ASSOCIATIONS);
            this._registerAssociations(this._viewersFileAssociations);
            this._registerAssociations(settings.fileAssociations);
        });
    }

    public ngOnDestroy() {
        this._settingsSub.unsubscribe();
    }

    public getComponentType(fileType: string): FileViewerType | null {
        return this._viewers.get(fileType) as any || null;
    }

    public getType(filename: string): string | null {
        let extensionMatch: FileAssociation;
        filename = filename.toLowerCase();
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
        return extensionMatch && extensionMatch.type || null;
    }

    public registerViewer(registration: ViewerRegistration) {
        this._viewers.set(registration.name, registration.component as any);
        if (registration.extensions) {
            for (const extension of registration.extensions) {
                this._viewersFileAssociations[extension] = registration.name;
            }
        }
    }

    private _registerAssociations(fileAssociations: StringMap<string>) {
        if (!fileAssociations) { return; }
        for (const [extension, type] of Object.entries(fileAssociations)) {
            if (!type || !extension) {
                log.error(`Trying to register an invalid file association ${extension}, ${type}`);
                continue;
            }
            if (this._viewers.has(type)) {
                this._associations.push({ extension: extension.toLowerCase(), type });
            }
        }
    }
}
