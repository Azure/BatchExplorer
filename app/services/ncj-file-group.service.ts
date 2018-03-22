import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { FileGroupOptionsDto } from "app/models/dtos";
import { PythonRpcService } from "./python-rpc/python-rpc.service";

/**
 * Service to handle file-group calls to the Python RPC service.
 */
@Injectable()
export class NcjFileGroupService {
    constructor(
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
            return Observable.throw(ServerError.fromPython(error));
        });

        return observable;
    }
}
