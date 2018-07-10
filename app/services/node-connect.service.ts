import { Injectable } from "@angular/core";
import { OS, SecureUtils } from "@batch-flask/utils";
import * as path from "path";
import { Observable } from "rxjs";

import { FileSystemService, SSHKeyService, SettingsService } from ".";

@Injectable()
export class NodeConnectService {
    public publicKeyFile: string;
    private rdpContent: string;
    private nodeId: number;
    private _username: string;
    private _password: string;
    private defaultUsername: string;

    constructor(
        private settingsService: SettingsService,
        private fs: FileSystemService,
        private sshKeyService: SSHKeyService,
    ) {
        if (this.settingsService.settings["node-connect.default-username"]) {
            this.defaultUsername = this.settingsService.settings["node-connect.default-username"];
        } else {
            this.defaultUsername = SecureUtils.username();
        }

        this.publicKeyFile = path.join(this.fs.commonFolders.home, ".ssh", "id_rsa.pub");
    }

    public get username(): string {
        let username = this._username || this.defaultUsername;
        username = username.replace(/ /g, "");
        return username;
    }

    public set username(name) {
        this._username = name;
    }

    public get password(): string {
        return this._password;
    }

    public set password(pw) {
        this._password = pw;
    }

    public get publicKey(): Observable<string> {
        return this.sshKeyService.getLocalPublicKey(this.publicKeyFile);
    }

    /**
     * Save the rdp file to the given location
     */
    public saveRdpFile(rdpContent, connectionSettings, nodeId): Observable<string> {
        this.rdpContent = this._computeFullRdpFile(rdpContent, connectionSettings);
        this.nodeId = nodeId;
        const directory = OS.isWindows() ?
            path.join(this.fs.commonFolders.temp, "rdp") :
            this.fs.commonFolders.downloads;
        const filename = `${this.nodeId}.rdp`;
        return Observable.fromPromise(this.fs.saveFile(path.join(directory, filename), this.rdpContent));
    }

    private _computeFullRdpFile(rdpContent, connectionSettings) {
        const rdpBaseContent = rdpContent || this._buildRdpFromConnection(connectionSettings);
        return `${rdpBaseContent}\nusername:s:.\\${this.username || this.defaultUsername}\nprompt for credentials:i:1`;
    }

    private _buildRdpFromConnection(connectionSettings) {
        const {ip, port} = connectionSettings;
        const address = `full address:s:${ip}:${port}`;
        return address;
    }
}
