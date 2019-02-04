import { Injectable, OnDestroy, Type } from "@angular/core";
import { BatchFlaskUserConfiguration, UserConfigurationService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";
import { FileViewer } from "../file-viewer";
import { ImageFileViewerComponent } from "../image-file-viewer";
import { LogFileViewerComponent } from "../log-file-viewer";
import { TextFileViewerComponent } from "../text-file-viewer";
import { DEFAULT_FILE_ASSOCIATIONS } from "./default-associations";

export interface FileAssociation {
    extension?: string;
    type: string;
}

export type FileViewerType = typeof FileViewer & Type<FileViewer>;

export interface ViewerRegistration {
    name: string;
    component: Type<FileViewer>;
    extensions?: string[];
}

@Injectable({ providedIn: "root" })
export class FileTypeAssociationService implements OnDestroy {
    private _associations: FileAssociation[] = [];
    private _destroy = new Subject();
    private _viewers = new Map<string, FileViewerType>();
    private _viewersFileAssociations: StringMap<string> = {};
    private _viewerChanges = new Subject();
    private _localAssociations = new BehaviorSubject([]);

    constructor(private settingsService: UserConfigurationService<BatchFlaskUserConfiguration>) {
        this.registerViewer({ name: "text", component: TextFileViewerComponent });
        this.registerViewer({ name: "log", component: LogFileViewerComponent });
        this.registerViewer({ name: "image", component: ImageFileViewerComponent });

        combineLatest(
            settingsService.watch("fileAssociations"),
            this._localAssociations,
            this._viewerChanges.pipe(startWith(null)),
        ).pipe(
            takeUntil(this._destroy),
        ).subscribe(([fileAssociations, localAssociations, _]) => {
            this._associations = [];
            this._registerAssociations(DEFAULT_FILE_ASSOCIATIONS);
            this._registerAssociations(this._viewersFileAssociations);
            this._registerAssociations(fileAssociations);
            this._registerAssociations(localAssociations);
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._viewerChanges.complete();
        this._localAssociations.complete();
    }

    /**
     * Returns a new instance of the service with local overrides
     */
    public withLocalAssociations(associations: FileAssociation[]): FileTypeAssociationService {
        const service = new FileTypeAssociationService(this.settingsService);
        service._viewers = this._viewers;
        service._localAssociations.next(associations);
        return service;
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
                        break;
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
        this._viewerChanges.next();
    }

    private _registerAssociations(fileAssociations: StringMap<string> | FileAssociation[]) {
        if (!fileAssociations) { return; }
        const array = Array.isArray(fileAssociations)
            ? fileAssociations
            : Object.entries(fileAssociations).map(([extension, type]) => ({ extension, type }));

        for (const { extension, type } of array) {
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
