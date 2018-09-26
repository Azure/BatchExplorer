import { Injectable } from "@angular/core";
import { app } from "electron";

@Injectable()
export class BatchExplorerProcess {
    public restart() {
        app.relaunch();
        app.quit();
    }
}
