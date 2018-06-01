import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener } from "@angular/core";
import { ElectronShell } from "@batch-flask/ui";
import * as path from "path";

import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService,
} from "@batch-flask/ui/context-menu";
import { FileSystemService, PythonRpcService } from "app/services";
import "./rpc-server-status.scss";

@Component({
    selector: "bl-rpc-server-status",
    templateUrl: "rpc-server-status.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RpcServerStatusComponent {
    @HostBinding("class.connected")
    public connected = false;

    @HostBinding("title")
    public get title() {
        if (this.connected) {
            return "Python service is connnected and running.";
        } else {
            return "Python service is currently disconnected. Click to take action.";
        }
    }

    constructor(
        private pythonRpcService: PythonRpcService,
        private contextMenuService: ContextMenuService,
        private fs: FileSystemService,
        private shell: ElectronShell,
        changeDetector: ChangeDetectorRef,
    ) {
        pythonRpcService.connected.subscribe((connected) => {
            this.connected = connected;
            changeDetector.markForCheck();
        });
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
