import { Component, Input, OnInit } from "@angular/core";
import { ServerError, autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/ui";
import { OS } from "@batch-flask/utils";
import { clipboard } from "electron";
import { List } from "immutable";
import * as moment from "moment";
import * as path from "path";

import { SidebarRef } from "@batch-flask/ui/sidebar";
import { Node, NodeAgentSku, NodeConnectionSettings, Pool } from "app/models";
import {
    AddNodeUserAttributes,
    BatchLabsService,
    FileSystemService,
    NodeService,
    NodeUserService,
    SSHKeyService,
    SettingsService,
} from "app/services";
import { PoolUtils, SecureUtils } from "app/utils";
import { ExternalApplication } from "common/constants";
import { Observable } from "rxjs";
import { flatMap, share, tap } from "rxjs/operators";
import "./node-connect.scss";

@Component({
    selector: "bl-node-connect",
    templateUrl: "node-connect.html",
})
export class NodeConnectComponent implements OnInit {
    public formVisible: boolean = false;
    public credentials: AddNodeUserAttributes = null;
    public agentSkus: List<NodeAgentSku>;
    public windows = false;
    public linux = false;
    public hasIp = false;
    public hasLocalPublicKey: boolean;
    public defaultUsername: string;
    public username: string = "";
    public password: string = "";
    public error: ServerError = null;
    public tooltip: string = "";
    public ipFromRDP: string = "";
    public loading: boolean = false;
    public publicKeyFile: string;
    public processLaunched: boolean = false;
    public savedToClipboard: boolean = false;
    public userUpdatedFromForm: boolean = false;

    /**
     * Base content for the rdp file(IP Address).
     * This is either downloaded from the api on CloudService nodes or generated from the ip/port on VMs nodes
     */
    public rdpContent: string;
    public connectionSettings: NodeConnectionSettings;

    private expiryTime: Date = null;
    private isAdmin: boolean = null;

    @Input()
    public set pool(pool: Pool) {
        this._pool = pool;
        if (pool) {
            this.hasIp = Boolean(pool.virtualMachineConfiguration);
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

    private _pool: Pool;
    private _node: Node;

    constructor(
        public sidebarRef: SidebarRef<any>,
        public settingsService: SettingsService,
        private nodeUserService: NodeUserService,
        private nodeService: NodeService,
        private batchLabs: BatchLabsService,
        private sshKeyService: SSHKeyService,
        private fs: FileSystemService,
        private shell: ElectronShell,
    ) {
        if (settingsService.settings["node-connect.default-username"]) {
            this.defaultUsername = settingsService.settings["node-connect.default-username"];
        } else {
            this.defaultUsername = SecureUtils.username();
        }

        // set the tooltip for the disabled connect button: ssh-based for linux, password for windows
        this.tooltip = this.linux ? "No SSH Keys Found" : "Invalid Password";
    }

    public ngOnInit() {
        const data = this.nodeService.listNodeAgentSkus();
        data.fetchAll().subscribe(() => {
            data.items.take(1).subscribe((agentSkus) => {
                this.agentSkus = agentSkus;
                this.windows = PoolUtils.isWindows(this.pool, agentSkus);
                data.dispose();
            });
        });

        const separator = OS.isWindows() ? "\\" : "/";
        this.publicKeyFile = `${this.fs.commonFolders.home}${separator}.ssh${separator}id_rsa.pub`;

        this.sshKeyService.hasLocalPublicKey(this.publicKeyFile).subscribe(hasKey => this.hasLocalPublicKey = hasKey);
    }

    @autobind()
    public autoConnect() {
        // set the processLaunched flag to false, since we will launch a new process
        this.processLaunched = false;
        this.loading = true;

        const credentials = {
            isAdmin: this.isAdmin !== null ? this.isAdmin : true,
            name: this.username || this.defaultUsername,
            expiryTime: this.expiryTime || moment().add(moment.duration({days: 1})).toDate(),
            sshPublicKey: "",
            password: this.password || SecureUtils.passwordWindowsValid(),
        };

        if (this.linux) {
            // we are going to use ssh keys, so we don't need a password
            delete credentials.password;

            const pidObs = this._initSSH(credentials, this.userUpdatedFromForm);
            pidObs.subscribe({
                next: (pid) => {
                    this.processLaunched = true;
                    this.loading = false;
                    this.error = null;
                },
                error: (error) => {
                    this.loading = false;
                    this.error = error;
                    throw error;
                },
            });
        } else {
            // for windows, we don't need the public key because we cannot ssh
            delete credentials.sshPublicKey;

            this._addOrUpdateUser(credentials).flatMap(() => {
                this.loading = false;
                this.error = null;

                // save password to clipboard
                clipboard.writeText(this.credentials.password);

                // create and launch the rdp program
                return this._saveRdpFile();
            }).subscribe({
                next: (filename) => {
                    this.shell.openItem(filename);
                },
                error: (err) => {
                    this.loading = false;
                    this.error = err;
                    try {
                        // get the reason for the error (likely an invaid password)
                        this.error = err;
                    } catch (e) {
                        throw err;
                    }
                },
            });
        }
    }

    /**
     * Stores the values from the node-user-credentials form in instance variables
     * @param credentials The credentials entered on the node user credentials form
     */
    @autobind()
    public storeCredentialsFromForm(credentials: AddNodeUserAttributes) {
        // update the main template
        this.username = credentials.name;
        this.password = credentials.password;
        this.expiryTime = credentials.expiryTime;
        if (credentials.isAdmin) {
            this.isAdmin = credentials.isAdmin;
        }

        // hide the node user credentials form
        this.formVisible = false;
    }

    public get sshCommand() {
        if (!this.connectionSettings) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;

        return `ssh ${this.username || this.defaultUsername}@${ip} -p ${port}`;
    }

    @autobind()
    public specifyCredentials() {
        this.formVisible = true;
    }

    @autobind()
    public goToHome() {
        this.formVisible = false;
        this.processLaunched = false;
    }

    @autobind()
    public close() {
        this.sidebarRef.destroy();
    }

    @autobind()
    public downloadRdp() {
        return this._saveRdpFile().subscribe({
            next: (filename) => {
                this.shell.showItemInFolder(filename);
            },
        });
    }

    private _addOrUpdateUser(credentials) {
        return this.nodeUserService.addOrUpdateUser(this.pool.id, this.node.id, credentials).pipe(
            tap(() => {
                this.credentials = credentials;
            }),
        );
    }

    /**
     * Load either the RDP file or the node connection settings depending if the VM is IAAS or PAAS
     */
    private _loadConnectionData() {
        if (!this.pool || !this.node) { return; }
        if (PoolUtils.isPaas(this.pool)) {
            this.nodeService.getRemoteDesktop(this.pool.id, this.node.id).subscribe((rdp) => {
                this.rdpContent = rdp;

                // extract the ip address from the rdp file
                this.ipFromRDP = rdp.match(/[0-9.]{7,}/)[0];
            });
        } else {
            this.nodeService.getRemoteLoginSettings(this.pool.id, this.node.id).subscribe((connection) => {
                this.connectionSettings = connection;
            });
        }
    }

    /**
     * Spawns a node child process to launch a terminal and ssh into the remote node (linux only)
     * @param credentials an object containing credentials for the ssh command (username, IP, port, ssh public key)
     * @returns an Observable that emits the process id of the child process
     */
    private _initSSH(credentials: AddNodeUserAttributes, skipUpdate: boolean): Observable<number> {
        // if the node-user-credentials form has been updated, skip addOrUpdateUser
        if (skipUpdate) {
            const args = {
                command: this.sshCommand,
            };
            return Observable.fromPromise(this.batchLabs.launchApplication(ExternalApplication.terminal, args));
        }

        // fetch the public key from the user's filesystem
        const obs =  this.sshKeyService.getLocalPublicKey(this.publicKeyFile).pipe(
            flatMap((key) => {
                credentials.sshPublicKey = key;                     // set the key to be the fetched public key
                this.credentials = credentials;
                return this._addOrUpdateUser(credentials);          // set the user that will be used for authentication
            }),
            flatMap(() => {
                // launch a terminal subprocess with the command to access the node
                const args = {
                    command: this.sshCommand,
                };
                return Observable.fromPromise(this.batchLabs.launchApplication(ExternalApplication.terminal, args));
            }),
            share(),
        );
        return obs;
    }

    /**
     * Save the rdp file to the given location
     */
    private _saveRdpFile(): Observable<string> {
        const content = this._computeFullRdpFile();
        const directory = OS.isWindows() ?
            path.join(this.fs.commonFolders.temp, "rdp") :
            this.fs.commonFolders.downloads;
        const filename = `${this.node.id}.rdp`;
        return Observable.fromPromise(this.fs.saveFile(path.join(directory, filename), content));
    }

    private _computeFullRdpFile() {
        const rdpBaseContent = this.rdpContent || this._buildRdpFromConnection();
        return `${rdpBaseContent}\nusername:s:.\\${this.username || this.defaultUsername}\nprompt for credentials:i:1`;
    }

    private _buildRdpFromConnection() {
        const {ip, port} = this.connectionSettings;
        const address = `full address:s:${ip}:${port}`;
        return address;
    }
}
