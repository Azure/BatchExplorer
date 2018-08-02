import { BehaviorSubject } from "rxjs";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { Certificate } from "app/models";
import { CertificateService } from "app/services";
import { LongRunningDeleteAction } from "app/services/core";

export class DeleteCertificateAction extends LongRunningDeleteAction {
    constructor(private certificateService: CertificateService, certificateThumbprints: string[]) {
        super("certificate", certificateThumbprints);
    }

    public deleteAction(thumbprint: string) {
        return this.certificateService.delete(thumbprint);
    }

    protected waitForDelete(thumbprint: string, taskManager?: BackgroundTaskService) {
        this.certificateService.get(thumbprint).subscribe({
            next: (certificate: Certificate) => {
                const task = new WaitForDeletePoller(() => this.certificateService.get(thumbprint));
                if (taskManager) {
                    taskManager.startTask(`Deleting Certificate '${thumbprint}'`, (bTask) => {
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
                // No need to watch for Certificate it is already deleted
                this.markItemAsDeleted();
            },
        });
    }
}
