import { Component, Input, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { remote } from "electron";
import * as fs from "fs";
import { List } from "immutable";
import * as path from "path";
import * as mkdirp from "mkdirp";
import { AsyncSubject, Observable } from "rxjs";

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

    @autobind()
    public connectWithRdp() {
        return this._saveRdpFile().do((filename) => {
            remote.shell.openItem(filename);
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
            return path.join(remote.app.getPath("temp"), "batch-labs", "rdp");
        } else {
            return remote.app.getPath("downloads");
        }
    }

    private _saveRdpFile(): Observable<string> {
        const content = this._computeFullRdpFile();
        const dir = this.tempDownloadFolder;
        const subject = new AsyncSubject();
        mkdirp(dir, () => {
            const filename = path.join(dir, `${this.nodeId}.rdp`);
            fs.writeFile(filename, content, (err) => {
                if (err) {
                    console.error("An error ocurred downloading the rdp file " + err.message);
                    subject.error(err.message);
                }
                subject.next(filename)
                return subject.complete();
            });
        });

        return subject.asObservable();
    }


    private _computeFullRdpFile() {
        return `${this.rdpBaseContent}\nusername:s:${this.credentials.username}\nprompt for credentials:i:1`;
    }

    private _buildRdpFromConnection() {
        return ``;
    }
}
