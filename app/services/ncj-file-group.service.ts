import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { Constants } from "common";
import { PythonRpcService } from "./python-rpc/python-rpc.service";
import { StorageService } from "./storage.service";

/**
 * Service to handle file-group calls to the Python RPC service.
 */
@Injectable()
export class NcjFileGroupService {
    constructor(
        private storageService: StorageService,
        private pythonRpcService: PythonRpcService) {
    }

    public createEmptyFileGroup(name: string): Observable<any> {
        return this.storageService.createContainer(`${Constants.ncjFileGroupPrefix}${name}`);
    }

    /**
     * Calls the Batch CLI via Python to create a file-group in the Batch account's
     * linked storage account.
     */
    public createFileGroup(fileGroup: FileGroupCreateDto): Observable<any> {

        /**
         * TODO: This method needs a callback for updating the UI with the status of the upload
         * progress. Anna was working on changing the file.upload callback parameter to include the
         * filename in order for this to happen.
         */
        const observable = this.pythonRpcService.callWithAuth("create-file-group", [
            fileGroup.name,
            fileGroup.folder,
            { ...fileGroup.options, recursive: fileGroup.includeSubDirectories },
        ]).catch((error) => {
            return Observable.throw(ServerError.fromPython(error));
        });

        return observable;
    }

    /**
     * Calls the Batch CLI via Python to create a file-group in the Batch account's
     * linked storage account.
     */
    public addFilesToFileGroup(fileGroupName: string, files: string[], root: string = null): Observable<any> {

        /**
         * TODO: This method needs a callback for updating the UI with the status of the upload
         * progress. Anna was working on changing the file.upload callback parameter to include the
         * filename in order for this to happen.
         */
        const observable = this.pythonRpcService.callWithAuth("add-files-to-file-group", [
            fileGroupName,
            files,
            root,
        ]).catch((error) => {
            return Observable.throw(ServerError.fromPython(error));
        });

        return observable;
    }
}
