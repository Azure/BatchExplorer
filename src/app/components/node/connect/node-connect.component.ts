import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { ServerError, autobind } from "@batch-flask/core";
import { ClipboardService, ElectronShell, FileSystemService } from "@batch-flask/electron";
import * as path from "path";

import { SidebarRef } from "@batch-flask/ui/sidebar";
import { SecureUtils } from "@batch-flask/utils";
import { Node, NodeConnectionSettings, Pool } from "app/models";
import {
    AddNodeUserAttributes,
    BatchExplorerService,
    NodeConnectService,
    NodeUserService,
    SettingsService,
} from "app/services";
import { PoolUtils } from "app/utils";
import { ExternalApplication } from "common/constants";
import { DateTime, Duration } from "luxon";
import { Observable, from } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import "./node-connect.scss";

@Component({
    selector: "bl-node-connect",
    templateUrl: "node-connect.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeConnectComponent implements OnInit {
    public formVisible: boolean = false;
    public error: ServerError = null;
    public loading: boolean = false;
    public credentials: AddNodeUserAttributes;
    public publicKeyFile: string;
    public passwordCopied: boolean = false;

    // NOTE: using linux does not necessarily mean using SSH! (user can still use password)
    public linux = false;
    public usingSSHKeys = false;

    /**
     * Base content for the rdp file(IP Address).
     * This is either downloaded from the api on CloudService nodes or generated from the ip/port on VMs nodes
     */
    public connectionSettings: NodeConnectionSettings;
    private _pool: Pool;
    private _node: Node;

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

    constructor(
        public sidebarRef: SidebarRef<any>,
        public settingsService: SettingsService,
        private nodeUserService: NodeUserService,
        private batchExplorer: BatchExplorerService,
        private nodeConnectService: NodeConnectService,
        private shell: ElectronShell,
        private changeDetector: ChangeDetectorRef,
        private fs: FileSystemService,
        private clipboardService: ClipboardService,
    ) { }

    public ngOnInit() {
        this.credentials = {
            name: this.settingsService.settings["node-connect.default-username"],
            expiryTime: null,
            isAdmin: true,
            sshPublicKey: "",
        };
        this.generatePassword();
        this.publicKeyFile = path.join(this.fs.commonFolders.home, ".ssh", "id_rsa.pub");

        this.linux = PoolUtils.isLinux(this.pool);

        // skip the public key thing if we are on windows
        if (this.linux) {
            this.nodeConnectService.getPublicKey(this.publicKeyFile).subscribe({
                next: (key) => {
                    this.credentials.sshPublicKey = key;
                    this.usingSSHKeys = true;
                    this.changeDetector.markForCheck();
                },
                error: (err) => {
                    this.usingSSHKeys = false;
                    this.changeDetector.markForCheck();
                },
            });
        }
    }

    @autobind()
    public generatePassword(): void {
        this.credentials.password = SecureUtils.generateWindowsPassword();
    }

    @autobind()
    public autoConnect(): Observable<any> {
        this.loading = true;

        if (!this.credentials.password) {
            this.generatePassword();
        }

        const credentials = {...this.credentials};
        if (!credentials.expiryTime) {
            credentials.expiryTime = DateTime.local().plus(Duration.fromObject({days: 1})).toJSDate();
        }

        if (this.linux) {
            // we are going to use ssh keys, so we don't need a password
            if (this.usingSSHKeys) {
                delete credentials.password;
            } else {
                delete credentials.sshPublicKey;
            }

            const pidObs = this._initSSH(credentials);
            pidObs.subscribe({
                next: (pid) => {
                    // if using password, save it to clipboard
                    if (!this.usingSSHKeys) {
                        this.clipboardService.writeText(credentials.password);
                        this.passwordCopied = true;
                        this.changeDetector.markForCheck();
                    }
                    this.loading = false;
                    this.error = null;
                },
                error: (error) => {
                    this.loading = false;
                    this.error = error;
                    throw error;
                },
            });
            return pidObs;
        } else {
            // for windows, we don't need the public key because we cannot ssh
            delete credentials.sshPublicKey;

            const rdpObs = this._initRDP(credentials);
            rdpObs.subscribe({
                next: (filename) => {
                    this.shell.openItem(filename);
                },
                error: (err) => {
                    this.loading = false;
                    this.error = err;
                    try {
                        // get the reason for the error (likely an invalid password)
                        this.error = err;
                    } catch (e) {
                        throw err;
                    }
                },
            });
            return rdpObs;
        }
    }

    /**
     * Stores the values from the node-user-credentials form in instance variables
     * @param credentials The credentials entered on the node user credentials form
     */
    @autobind()
    public storeCredentialsFromForm(credentials: AddNodeUserAttributes) {
        // update the main template
        this.credentials = {...credentials};

        // if the user entered a password in the form, use it to connect
        if (credentials.password) {
            this.usingSSHKeys = false;
        } else if (credentials.sshPublicKey) {
            this.usingSSHKeys = true;
        }

        this.changeDetector.markForCheck();

        // hide the node user credentials form
        this.formVisible = false;
    }

    public get sshCommand() {
        if (!this.connectionSettings) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;

        return `ssh ${this.credentials.name}@${ip} -p ${port}`;
    }

    @autobind()
    public configureCredentials() {
        this.formVisible = true;
    }

    @autobind()
    public goToHome() {
        this.formVisible = false;
    }

    @autobind()
    public close() {
        this.sidebarRef.destroy();
    }

    private _addOrUpdateUser(credentials) {
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
    private _initSSH(credentials: AddNodeUserAttributes): Observable<number> {
        // set the user that will be used for authentication
        const obs =  this._addOrUpdateUser(credentials).pipe(
            flatMap(() => {
                // launch a terminal subprocess with the command to access the node
                const args = {
                    command: this.sshCommand,
                };
                return from(this.batchExplorer.launchApplication(ExternalApplication.terminal, args));
            }),
            share(),
        );

        return obs;
    }

    private _initRDP(credentials: AddNodeUserAttributes): Observable<string> {
        const obs = this._addOrUpdateUser(credentials).pipe(
            flatMap(() => {
                this.loading = false;
                this.error = null;

                // save password to clipboard
                this.clipboardService.writeText(credentials.password);
                this.passwordCopied = true;
                this.changeDetector.markForCheck();

                // create and launch the rdp program
                return this.nodeConnectService.saveRdpFile(this.connectionSettings, this.credentials, this.node.id);
            }),
            share(),
        );

        return obs;
    }
}
