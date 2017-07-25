import { Injectable } from "@angular/core";
import * as path from "path";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { Constants } from "app/utils";
import { AccountService } from "./account.service";
import { AdalService } from "./adal/adal.service";
import { PythonRpcService } from "./python-rpc/python-rpc.service";

/**
 * Service to handle file-group calls to the Python RPC service.
 */
@Injectable()
export class CliFileGroupService {
    constructor(
        private adalService: AdalService,
        private accountService: AccountService,
        private pythonRpcService: PythonRpcService) {
    }

    /**
     * Calls the Batch CLI via Python to create a file-group in the Batch account's
     * linked storage account.
     */
    public createFileGroup(fileGroup: FileGroupCreateDto): Observable<any> {
        const batch = Constants.ResourceUrl.batch;
        const arm = Constants.ResourceUrl.arm;

        // We now need to pass in both the Batch and ARM tokens as we are dealing with storage.
        const observable = this.accountService.currentAccount.cascade((account) => {
            return this.adalService.accessTokenFor(account.subscription.tenantId, batch).cascade((batchToken) => {
                return this.adalService.accessTokenFor(account.subscription.tenantId, arm).cascade((armToken) => {
                    /**
                     * TODO: This method needs a callback for updating the UI with the status of the upload
                     * progress. Anna was working on changing the file.upload callback parameter to include the
                     * filename in order for this to happen.
                     */
                    return this.pythonRpcService.call("create_file_group", [
                        batchToken,
                        armToken,
                        fileGroup.name,
                        fileGroup.includeSubDirectories ? path.join(fileGroup.folder, "**//*") : fileGroup.folder,
                        fileGroup.options,
                        account.toJS(),
                    ]).catch((error) => {
                        return Observable.throw(ServerError.fromPython(error));
                    });
                });
            });
        }).share();

        return observable;
    }
}
