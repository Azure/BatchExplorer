import { Component, Input, OnInit } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { OS } from "@batch-flask/utils";
import { List } from "immutable";
import * as moment from "moment";

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
import { DateUtils, PoolUtils, SecureUtils } from "app/utils";
import { Application } from "common/constants";
import { Observable } from "rxjs";
import { flatMap, share, tap } from "rxjs/operators";
import "./node-connect.scss";

enum CredentialSource {
    Generated,
    Specified,
}

@Component({
    selector: "bl-node-connect",
    templateUrl: "node-connect.html",
})
export class NodeConnectComponent implements OnInit {
    public CredentialSource = CredentialSource;
    public credentialSource: CredentialSource = null;
    public credentials: AddNodeUserAttributes = null;
    public agentSkus: List<NodeAgentSku>;
    public windows = false;
    public linux = false;
    public hasIp = false;
    public expireTime: string;
    public hasLocalPublicKey: boolean;
    public defaultUsername: string;
    public username: string = "";
    public password: string = "";
    public warning: string = "";
    public tooltip: string = "";
    public connectLoading: boolean = false;
    public publicKeyFile: string;
    public processLaunched: boolean = false;

    /**
     * Base content for the rdp file(IP Address).
     * This is either downloaded from the api on CloudService nodes or generated from the ip/port on VMs nodes
     */
    public rdpContent: string;
    public connectionSettings: NodeConnectionSettings;

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
        // Todo use observable for this
        if (!this.connectionSettings) {
            return null;
        }

        // set the processLaunched flag to false, since we will launch a new process
        this.processLaunched = false;
        this.connectLoading = true;

        // set the warning to false, since the user is trying again
        this.warning = "";

        const credentials = {
            isAdmin: true,
            name: this.username || this.defaultUsername,
            expiryTime:  moment().add(moment.duration({days: 1})).toDate(),
            sshPublicKey: "",
            password: this.password,
        };

        if (this.linux) {
            // we are going to use ssh keys, so we don't need a password
            delete credentials.password;

            const pidObs = this._initSSH(credentials);
            pidObs.subscribe({
                next: (pid) => {
                    this.processLaunched = true;
                    this.connectLoading = false;
                },
                error: (error) => {
                    this.connectLoading = false;
                    throw error;
                },
            });
        } else {
            // for windows, we don't need the public key because we cannot ssh
            delete credentials.sshPublicKey;

            const obs = this.addOrUpdateUser(credentials).flatMap(() => {
                return new Observable(null);
            }).subscribe({
                next: () => { this.connectLoading = false; },
                error: (err) => {
                    this.connectLoading = false;
                    try {
                        // get the reason for the error (likely an invaid password)
                        this.warning = err.details.filter(detail => detail.key === "Reason").pop().value;
                    } catch (e) {
                        throw err;
                    }
                },
            });
        }
    }

    @autobind()
    public addOrUpdateUser(credentials) {
        return this.nodeUserService.addOrUpdateUser(this.pool.id, this.node.id, credentials).pipe(
            tap(() => {
                this.credentials = credentials;
                this.expireTime = DateUtils.fullDateAndTime(this.credentials.expiryTime);
            }),
        );
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
        this.credentialSource = CredentialSource.Specified;
    }

    @autobind()
    public goToHome() {
        this.credentialSource = null;
        this.processLaunched = false;
    }

    @autobind()
    public close() {
        this.sidebarRef.destroy();
    }

    /**
     * Load either the RDP file or the node connection settings depending if the VM is IAAS or PAAS
     */
    private _loadConnectionData() {
        if (!this.pool || !this.node) { return; }
        if (PoolUtils.isPaas(this.pool)) {
            this.nodeService.getRemoteDesktop(this.pool.id, this.node.id).subscribe((rdp) => {
                this.rdpContent = rdp;
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
    private _initSSH(credentials): Observable<number> {
        // fetch the public key from the user's filesystem
        const obs =  this.sshKeyService.getLocalPublicKey(this.publicKeyFile).pipe(
            flatMap((key) => {
                this.credentialSource = CredentialSource.Generated; // set the credentials source to be autogenerated
                credentials.sshPublicKey = key;                     // set the key to be the fetched public key
                this.credentials = credentials;
                return this.addOrUpdateUser(credentials);           // set the user that will be used for authentication
            }),
            flatMap(() => {
                // launch a terminal subprocess with the command to access the node
                const args = {
                    command: PoolUtils.isWindows(this.pool) ? "" : this.sshCommand,
                };
                return Observable.fromPromise(this.batchLabs.launchApplication(Application.terminal, args));
            }),
            share(),
        );
        return obs;
    }
}
