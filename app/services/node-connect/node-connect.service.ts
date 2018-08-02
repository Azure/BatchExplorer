import { Injectable, OnDestroy } from "@angular/core";
import * as path from "path";
import { Observable, Subscription, from, of } from "rxjs";
import { flatMap, map, share } from "rxjs/operators";

import { OS } from "@batch-flask/utils";
import { ConnectionType, IaasNodeConnectionSettings, Node, NodeConnectionSettings, Pool } from "app/models";
import { AddNodeUserAttributes, FileSystemService, SSHKeyService, SettingsService } from "app/services";
import { AzureBatchHttpService } from "app/services/azure-batch/core";
import { PoolUtils } from "app/utils";

@Injectable()
export class NodeConnectService implements OnDestroy {
    private _defaultUsername: string;
    private _settingsSub: Subscription;

    constructor(
        private settingsService: SettingsService,
        private fs: FileSystemService,
        private sshKeyService: SSHKeyService,
        private http: AzureBatchHttpService,
    ) {
        this._settingsSub = this.settingsService.settingsObs.subscribe((settings) => {
            this._defaultUsername = settings["node-connect.default-username"];
        });
    }

    public ngOnDestroy() {
        this._settingsSub.unsubscribe();
    }

    public getPublicKey(keyFile): Observable<string> {
        return this.sshKeyService.getLocalPublicKey(keyFile);
    }

    /**
     * Save the rdp file to the given location
     */
    public saveRdpFile(connectionSettings: NodeConnectionSettings,
                       credentials: AddNodeUserAttributes,
                       nodeId: string): Observable<string> {
        const rdpContent = this._computeFullRdpFile(connectionSettings, credentials);
        const directory = OS.isWindows() ?
            path.join(this.fs.commonFolders.temp, "rdp") :
            this.fs.commonFolders.downloads;
        const filename = `${nodeId}.rdp`;
        return from(this.fs.saveFile(path.join(directory, filename), rdpContent));
    }

    public getConnectionSettings(pool: Pool, node: Node): Observable<NodeConnectionSettings> {
        if (PoolUtils.isPaas(pool)) {
            return this._getRemoteDesktop(pool.id, node.id).pipe(
                flatMap((rdp) => {
                    const settings = this._rdpToNodeConnectionSettings(rdp);
                    return of({
                        ip: settings.remoteLoginIPAddress,
                        port: settings.remoteLoginPort,
                        type: ConnectionType.RDP,
                        loadBalanceInfo: settings.remoteLoginLoadBalanceInfo || null,
                    } as NodeConnectionSettings);
                }),
            );
        } else {
            return this._getRemoteLoginSettings(pool.id, node.id).pipe(
                flatMap(settings => {
                    return of({
                        ip: settings.ip,
                        port: settings.port,
                        type: PoolUtils.isLinux(pool) ? ConnectionType.SSH : ConnectionType.RDP,
                        loadBalanceInfo: null,
                    } as NodeConnectionSettings);
                }),
            );
        }
    }

    private _computeFullRdpFile(connectionSettings: NodeConnectionSettings,
                                credentials: AddNodeUserAttributes): string {
        const rdpBaseContent = this._buildRdpFromConnection(connectionSettings);
        let rdpfile = `${rdpBaseContent}`
            + `\nusername:s:.\\${credentials.name || this._defaultUsername}`
            + "\nprompt for credentials:i:1";

        if (connectionSettings.loadBalanceInfo) {
            rdpfile += `\nLoadBalanceInfo:s:${connectionSettings.loadBalanceInfo}`;
        }
        return rdpfile;
    }

    private _buildRdpFromConnection(connectionSettings: NodeConnectionSettings): string {
        const {ip, port} = connectionSettings;
        let address = `full address:s:${ip}`;
        if (port) {
            address += `:${port}`;
        }
        return address;
    }

    private _getRemoteDesktop(poolId: string, nodeId: string, options: any = {}): Observable< string> {
        return this.http.get(`/pools/${poolId}/nodes/${nodeId}/rdp`, {
            observe: "response",
            responseType: "text",
        }).map((data) => {
            return data.body as any;
        });
    }

    // tslint:disable-next-line:max-line-length
    private _getRemoteLoginSettings(poolId: string, nodeId: string, options = {}): Observable < IaasNodeConnectionSettings> {
        return this.http.get(`/pools/${poolId}/nodes/${nodeId}/remoteloginsettings`).pipe(
            map(data => new IaasNodeConnectionSettings(data)),
            share(),
        );
    }

    private _rdpToNodeConnectionSettings(rdp: string): any {
        const lines = rdp.split("\n").filter(line => {
            line = line.toLowerCase();
            return (line.includes("loadbalanceinfo") || line.includes("full address"));
        });

        const obj = {
            remoteLoginIPAddress: null,
            remoteLoginPort: null,
            remoteLoginLoadBalanceInfo: null,
            remoteLoginType: ConnectionType.RDP,
        } as NodeConnectionSettings;

        lines.forEach(line => {
            const segments = line.split(":");
            segments[0] = segments[0].toLowerCase();
            if (segments[0] === "loadbalanceinfo") {
                obj.remoteLoginLoadBalanceInfo = segments.slice(2).join(":");
            } else if (segments[0] === "full address") {
                obj.remoteLoginIPAddress = segments[2];
                obj.remoteLoginPort = +segments[3] || null;
            }
        });

        return obj;
    }
}
