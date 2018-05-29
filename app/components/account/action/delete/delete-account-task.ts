import { BehaviorSubject } from "rxjs";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { AccountResource } from "app/models";
import { AccountService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

export class DeleteAccountTask extends LongRunningDeleteAction {
    constructor(private accountService: AccountService, accountIds: string[]) {
        super("account", accountIds);
    }

    protected deleteAction(id) {
        return this.accountService.deleteBatchAccount(id);
    }

    protected waitForDelete(id: string, taskManager?: BackgroundTaskService) {
        this.accountService.get(id).subscribe({
            next: (account: AccountResource) => {
                const task = new WaitForDeletePoller(() => this.accountService.get(id));
                if (taskManager) {
                    taskManager.startTask(`Deleting Batch Account '${id}'`, (bTask) => {
                        return task.start(bTask.progress);
                    });
                } else {
                    task.start(new BehaviorSubject<any>(-1)).subscribe({
                        complete: () => {
                            this.markItemAsDeleted();
                        },
                    });
                }
            },
            error: (error) => {
                // No need to watch for Batch account it is already deleted
                this.markItemAsDeleted();
            },
        });
    }
}
