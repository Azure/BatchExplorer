import { Component, Input, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { List } from "immutable";

import { SidebarRef } from "app/components/base/sidebar";
import { Node, NodeAgentSku, NodeConnectionSettings, Pool } from "app/models";
import { AccountService, NodeService, NodeUserService } from "app/services";
import { PoolUtils, SecureUtils } from "app/utils";

enum CredentialSource {
    Generated,
    Specified,
}

@Component({
    selector: "bex-node-connect",
    templateUrl: "node-connect.html",
})
export class NodeConnectComponent implements OnInit {
    public CredentialSource = CredentialSource;
    public credentialSource: CredentialSource = null;

    public credentials = null;

    public agentSkus: List<NodeAgentSku>;

    public windows = false;
    public linux = false;
    public hasIp = false;

    /**
     * Base content for the rdp file(IP adress).
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
        }
    }
    public get pool() { return this._pool; };

    @Input()
    public node: Node;
    private _pool: Pool;

    constructor(
        public sidebarRef: SidebarRef<any>,
        private accountService: AccountService,
        private nodeUserService: NodeUserService,
        private nodeService: NodeService) {
    }

    public ngOnInit() {
        const data = this.accountService.listNodeAgentSkus();
        data.fetchAll().subscribe(() => {
            data.items.first().subscribe((agentSkus) => {
                this.agentSkus = agentSkus;
                this.windows = PoolUtils.isWindows(this.pool, agentSkus);
            });
        });
        this._loadConnectionData();
    }

    @autobind()
    public generateCredentials() {
        const credentials = {
            username: SecureUtils.username(),
            password: SecureUtils.password(),
        };

        return this.addOrUpdateUser(credentials).do(() => {
            this.credentialSource = CredentialSource.Generated;
        });
    }

    @autobind()
    public addOrUpdateUser(credentials) {
        return this.nodeUserService.addOrUpdateUser(this.pool.id, this.node.id, {
            name: credentials.username,
            password: credentials.password,
            isAdmin: true,
        }).do(() => {
            this.credentials = credentials;
        });
    }
    public get sshCommand() {
        if (!this.connectionSettings || !this.credentials) {
            return "N/A";
        }
        const {ip, port} = this.connectionSettings;
        return `ssh ${this.credentials.username}@${ip} -p ${port}`;
    }
    @autobind()
    public specifyCredentials() {
        this.credentialSource = CredentialSource.Specified;
    }

    /**
     * Load either the RDP file or the node connection settings depending if the VM is IAAS or PAAS
     */
    private _loadConnectionData() {
        if (PoolUtils.isPaas(this.pool)) {
            this.nodeService.getRemoteDesktop(this.pool.id, this.node.id).subscribe((rdp) => {
                this.rdpContent = rdp.content.toString();
            });
        } else {
            this.nodeService.getRemoteLoginSettings(this.pool.id, this.node.id).subscribe((connection) => {
                this.connectionSettings = connection;
            });
        }
    }
}
