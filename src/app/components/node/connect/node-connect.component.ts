import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { ServerError, UserConfigurationService, autobind } from "@batch-flask/core";
import { ClipboardService, ElectronShell, FileSystemService } from "@batch-flask/electron";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { SecureUtils } from "@batch-flask/utils";
import { Node, NodeConnectionSettings, Pool } from "app/models";
import {
    AddNodeUserAttributes,
    BatchExplorerService,
    NodeConnectService,
    NodeUserService,
    SSHKeyService,
} from "app/services";
import { PoolUtils } from "app/utils";
import { BEUserConfiguration } from "common";
import { ExternalApplication } from "common/constants";
import { DateTime, Duration } from "luxon";
import * as path from "path";
import { Observable, from } from "rxjs";
import { catchError, share, switchMap, tap } from "rxjs/operators";
import { UserConfiguration } from "./property-display";

import "./node-connect.scss";

@Component({
    selector: "bl-node-connect",
    templateUrl: "node-connect.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeConnectComponent implements OnInit {

    @Input()
    public set pool(pool: Pool) {
        this._pool = pool;
        if (pool) {
            this.linux = PoolUtils.isLinux(this.pool);
            this._loadConnectionData();
        }
    }

    public get pool() { return this._pool; }

    @Input()
    public set node(node: Node) {
        this._node = node;
        if (node) {
            this._loadConnectionData();
        }
    }

    public get node() { return this._node; }

    public get sshCommand() {
        if (!this.connectionSettings) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;

        return `ssh ${this.userConfig.name}@${ip} -p ${port}`;
    }

    public error: ServerError = null;
    public loading: boolean = false;
    public userConfig: UserConfiguration;
    public publicKeyFile: string;
    public passwordCopied: boolean = false;

    // NOTE: using linux does not necessarily mean using SSH! (user can still use password)
    public linux = false;

    /**
     * Base content for the rdp file(IP Address).
     * This is either downloaded from the api on CloudService nodes or generated from the ip/port on VMs nodes
     */
    public connectionSettings: NodeConnectionSettings;
    private _pool: Pool;
    private _node: Node;

    constructor(
        public sidebarRef: SidebarRef<any>,
        public settingsService: UserConfigurationService<BEUserConfiguration>,
        private nodeUserService: NodeUserService,
        private batchExplorer: BatchExplorerService,
        private sshKeyService: SSHKeyService,
        private nodeConnectService: NodeConnectService,
        private shell: ElectronShell,
        private changeDetector: ChangeDetectorRef,
        private fs: FileSystemService,
        private clipboardService: ClipboardService,
    ) { }

    public ngOnInit() {
        this.userConfig = {
            name: this.settingsService.current.nodeConnect.defaultUsername,
            expireIn: Duration.fromObject({ hours: 24 }),
            isAdmin: true,
            sshPublicKey: "",
        };
        this.generatePassword();
        this.publicKeyFile = path.join(this.fs.commonFolders.home, ".ssh", "id_rsa.pub");

        this.linux = PoolUtils.isLinux(this.pool);

        // skip the public key thing if we are on windows
        if (this.linux) {
            this.nodeConnectService.getPublicKey(this.sshKeyService.homePublicKeyPath).subscribe({
                next: (key) => {
                    this.userConfig.sshPublicKey = key;
                    this.userConfig.usingSSHKey = true;
                    this.changeDetector.markForCheck();
                },
                error: (err) => {
                    this.userConfig.usingSSHKey = false;
                    this.changeDetector.markForCheck();
                },
            });
        }
    }

    @autobind()
    public generatePassword(): void {
        this.userConfig.password = SecureUtils.generateWindowsPassword();
        this.changeDetector.markForCheck();
    }

    @autobind()
    public autoConnect(): Observable<any> {
        this.loading = true;

        const credentials = this._buildConfiguration();

        return this._addOrUpdateUser(credentials).pipe(
            switchMap(() => {
                if (this.linux) {
                    return this._openSSHTerminal();
                } else {
                    return this._openRDPConnection(credentials);
                }
            }),
            tap(() => {
                if (!this.linux || credentials.password) {
                    this.clipboardService.writeText(credentials.password);
                    this.passwordCopied = true;
                    this.changeDetector.markForCheck();
                }
                this.loading = false;
                this.error = null;
            }),
            catchError((error) => {
                this.loading = false;
                this.error = error;
                throw error;
            }),
            share(),
        );
    }

    @autobind()
    public addOrUpdateUser() {
        return this._addOrUpdateUser(this._buildConfiguration());
    }

    @autobind()
    public close() {
        this.sidebarRef.destroy();
    }

    private _buildConfiguration(): AddNodeUserAttributes {
        if (!this.userConfig.password) {
            this.generatePassword();
        }
        const userConfig = this.userConfig;

        const credentials: AddNodeUserAttributes = {
            name: this.userConfig.name,
            expiryTime: DateTime.local().plus(this.userConfig.expireIn).toJSDate(),
        };

        if (this.linux && userConfig.usingSSHKey) {
            // we are going to use ssh keys, so we don't need a password
            credentials.sshPublicKey = userConfig.sshPublicKey;
        } else {
            credentials.password = userConfig.password;
        }

        return credentials;
    }

    private _addOrUpdateUser(credentials: AddNodeUserAttributes) {
        return this.nodeUserService.addOrUpdateUser(this.pool.id, this.node.id, credentials);
    }

    /**
     * Load either the RDP file or the node connection settings depending if the VM is IAAS or PAAS
     */
    private _loadConnectionData() {
        if (!this.pool || !this.node) { return; }
        this.nodeConnectService.getConnectionSettings(this.pool, this.node).subscribe(settings => {
            this.connectionSettings = settings;
            this.changeDetector.markForCheck();
        });
    }

    /**
     * Spawns a node child process to launch a terminal and ssh into the remote node (linux only)
     * @param credentials an object containing credentials for the ssh command (username, IP, port, ssh public key)
     * @returns an Observable that emits the process id of the child process
     */
    private _openSSHTerminal(): Observable<number> {
        const args = {
            command: this.sshCommand,
        };
        return from(this.batchExplorer.launchApplication(ExternalApplication.terminal, args));
    }

    private _openRDPConnection(credentials: AddNodeUserAttributes): Observable<string> {
        this.loading = false;
        this.error = null;

        // create and launch the rdp program
        return this.nodeConnectService.saveRdpFile(this.connectionSettings, credentials, this.node.id).pipe(
            tap((filename) => this.shell.openItem(filename)),
            share(),
        );
    }
}
