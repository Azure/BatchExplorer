import { Injectable } from "@angular/core";
import { BlobContainer } from "app/models";
import { Constants } from "common";
import { Observable } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import { AutoStorageService } from "./storage/auto-storage.service";
import { StorageContainerService } from "./storage/storage-container.service";

/**
 * Service to handle file-group calls
 */
@Injectable({providedIn: "root"})
export class FileGroupService {
    constructor(
        private autoStorageService: AutoStorageService,
        private storageContainerService: StorageContainerService
    ) {
    }

    /**
     * Create a new empty file group
     * @param name Name of the file group(Without the fgrp- prefix)
     */
    public create(name: string) {
        const prefixedName = this.addFileGroupPrefix(name);
        return this.autoStorageService.get().pipe(
            flatMap((storageAccountId) =>  this.storageContainerService.create(storageAccountId, prefixedName)),
            share(),
        );
    }

    /**
     * Return the container by file group name
     * @param name name of the file group(Without the fgrp- prefix)
     */
    public get(name: string): Observable<BlobContainer> {
        const prefixedName = this.addFileGroupPrefix(name);
        return this.autoStorageService.get().pipe(
            flatMap((storageAccountId) => this.storageContainerService.get(storageAccountId, prefixedName)),
            share(),
        );
    }

    /**
     * Return the container name from a file group name
     * @param fileGroupName Name of the file group
     */
    public addFileGroupPrefix(fileGroupName: string) {
        return fileGroupName && !this.isFileGroup(fileGroupName)
            ? `${Constants.legacyFileGroupPrefix}${fileGroupName}`
            : fileGroupName;
    }

    /**
     * Return the file group name sans prefix from a container name that possibly
     * includes the file group prefix. Ignore if has no prefix.
     * @param containerName Name of the container including prefix
     */
    public removeFileGroupPrefix(containerName: string) {
        return this.isFileGroup(containerName)
            ? containerName.replace(Constants.legacyFileGroupPrefix, "")
            : containerName;
    }

    /**
     * Returns true if the file group starts with the correct prefix
     * @param fileGroup Name of the name to test
     */
    public isFileGroup(fileGroup: string) {
        return fileGroup && fileGroup.startsWith(Constants.legacyFileGroupPrefix);
    }
}
