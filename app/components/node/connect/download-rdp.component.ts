import { Component, Input } from "@angular/core";
import { autobind } from "core-decorators";
import { shell } from "electron";
import * as path from "path";
import { Observable } from "rxjs";

import { FileSystemService } from "app/services";
import { OS } from "app/utils";

@Component({
    selector: "bex-download-rdp",
    templateUrl: "download-rdp.html",
})
export class DownloadRdpComponent {
    @Input()
    public nodeId: string;

    @Input()
    public credentials: any;

    /**
     * If cloud service this will be provided
     */
    @Input()
    public rdpContent: string;

    /**
     * If VirtualMachine this will be provided
     */
    @Input()
    public connectionSettings: any;

    constructor(private fsService: FileSystemService) {

    }

    @autobind()
    public connectWithRdp() {
        return this._saveRdpFile().do((filename) => {
            shell.openItem(filename);
        });
    }

    @autobind()
    public downloadRdp() {
        return this._saveRdpFile().do((filename) => {
            shell.showItemInFolder(filename);
        });
    }

    public get isOSWindows() {
        return OS.isWindows();
    }

    public get rdpBaseContent() {
        if (this.rdpContent) {
            return this.rdpContent;
        } else {
            return this._buildRdpFromConnection();
        }
    }

    public get tempDownloadFolder() {
        if (OS.isWindows()) {
            return path.join(this.fsService.commonFolders.temp, "rdp");
        } else {
            return this.fsService.commonFolders.downloads;
        }
    }

    /**
     * Save the rdp file to the given location
     */
    private _saveRdpFile(): Observable<string> {
        const content = this._computeFullRdpFile();
        const directory = this.tempDownloadFolder;
        const filename = `${this.nodeId}.rdp`;
        return Observable.fromPromise(this.fsService.saveFile(filename, content, directory));
    }

    private _computeFullRdpFile() {
        return `${this.rdpBaseContent}\nusername:s:.\\${this.credentials.username}\nprompt for credentials:i:1`;
    }

    private _buildRdpFromConnection() {
        const {ip, port} = this.connectionSettings;
        const address = `full address:s:${ip}:${port}`;
        return address;
    }
}
