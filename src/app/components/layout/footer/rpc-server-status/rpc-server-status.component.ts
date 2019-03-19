import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy } from "@angular/core";
import { ElectronShell, FileSystemService } from "@batch-flask/electron";
import {
    ContextMenu,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuService,
} from "@batch-flask/ui/context-menu";
import { PythonRpcService } from "app/services";
import * as path from "path";
import { Subscription } from "rxjs";

import "./rpc-server-status.scss";

@Component({
    selector: "bl-rpc-server-status",
    templateUrl: "rpc-server-status.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RpcServerStatusComponent implements OnDestroy {
    @HostBinding("class.connected") public connected = false;

    public get title() {
        if (this.connected) {
            return "Python service is connnected and running.";
        } else {
            return "Python service is currently disconnected. Click to take action.";
        }
    }
    private _sub: Subscription;

    constructor(
        private pythonRpcService: PythonRpcService,
        private contextMenuService: ContextMenuService,
        private fs: FileSystemService,
        private shell: ElectronShell,
        changeDetector: ChangeDetectorRef,
    ) {
        this._sub = pythonRpcService.connected.subscribe((connected) => {
            this.connected = connected;
            changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public showContextMenu() {
        const items: any[] = [
            new ContextMenuItem("Restart service", () => this._restartServer()),
        ];
        if (this.connected) {
            items.push(new ContextMenuItem("Stop service", () => this._stopServer()));
        }
        items.push(new ContextMenuSeparator());
        items.push(new ContextMenuItem("View logs", () => this._openLogs()));

        this.contextMenuService.openMenu(new ContextMenu(items));
    }

    private _restartServer() {
        this.pythonRpcService.restartServer();
    }

    private _stopServer() {
        this.pythonRpcService.stopServer();
    }

    private _openLogs() {
        this.shell.openItem(path.join(this.fs.commonFolders.userData, "logs", "python-server.log"));
    }
}
