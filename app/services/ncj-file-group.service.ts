import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { Observable } from "rxjs";

import { BlobContainer } from "app/models";
import { FileGroupOptionsDto } from "app/models/dtos";
import { Constants } from "common";
import { PythonRpcService } from "./python-rpc/python-rpc.service";
import { AutoStorageService } from "./storage/auto-storage.service";
import { StorageContainerService } from "./storage/storage-container.service";

/**
 * Service to handle file-group calls to the Python RPC service.
 */
@Injectable()
export class NcjFileGroupService {
    constructor(
        private autoStorageService: AutoStorageService,
        private storageContainerService: StorageContainerService,
        private pythonRpcService: PythonRpcService) {
    }

    /**
     * Calls the Batch CLI via Python to create a file-group in the Batch account's
     * linked storage account.
     */
    public createOrUpdateFileGroup(
        fileGroupName: string,
        fileOrFolderPath: string,
        options: FileGroupOptionsDto,
        includeSubDirectories: boolean): Observable<any> {

        /**
         * NOTE: Have tweaked the progress callback to return percantage of any large file over 64MB
         * as per storage client. Would still like to have a throughput fugure in here also.
         */
        const observable = this.pythonRpcService.callWithAuth("create-file-group", [
            fileGroupName,
            fileOrFolderPath,
            { ...options, recursive: includeSubDirectories },
        ]).catch((error) => {
            return Observable.throw(error);
        });

        return observable;
    }

    /**
     * Create a new empty file group
     * @param name Name of the file group(Without the fgrp- prefix)
     */
    public create(name: string) {
        const prefixedName = this.addFileGroupPrefix(name);
        return this.autoStorageService.get().flatMap((storageAccountId) => {
            return this.storageContainerService.create(storageAccountId, prefixedName);
        }).share();
    }

    /**
     * Return the container by file group name
     * @param name name of the file group(Without the fgrp- prefix)
     */
    public get(name: string): Observable<BlobContainer> {
        const prefixedName = this.addFileGroupPrefix(name);
        return this.autoStorageService.get().flatMap((storageAccountId) => {
            return this.storageContainerService.get(storageAccountId, prefixedName);
        }).share();
    }
    /**
     * Return the container name from a file group name
     * @param fileGroupName Name of the file group
     */
    public addFileGroupPrefix(fileGroupName: string) {
        return fileGroupName && !this.isFileGroup(fileGroupName)
            ? `${Constants.ncjFileGroupPrefix}${fileGroupName}`
            : fileGroupName;
    }

    /**
     * Return the file group name sans prefix from a container name that possibly
     * includes the file group prefix. Ignore if has no prefix.
     * @param containerName Name of the container including prefix
     */
    public removeFileGroupPrefix(containerName: string) {
        return this.isFileGroup(containerName)
            ? containerName.replace(Constants.ncjFileGroupPrefix, "")
            : containerName;
    }

    /**
     * Returns true if the file group starts with the correct prefix
     * @param fileGroup Name of the name to test
     */
    public isFileGroup(fileGroup: string) {
        return fileGroup && fileGroup.startsWith(Constants.ncjFileGroupPrefix);
    }
}
