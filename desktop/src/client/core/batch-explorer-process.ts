import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { app } from "electron";

@Injectable()
export class BatchExplorerProcess {
    public restart() {
        log.info("Restarting application");
        app.relaunch();
        app.quit();
    }
}
