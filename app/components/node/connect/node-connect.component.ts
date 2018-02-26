import { Component, Input, OnInit } from "@angular/core";
import { autobind } from "app/core";
import { List } from "immutable";

import { SidebarRef } from "app/components/base/sidebar";
import { Node, NodeAgentSku, NodeConnectionSettings, Pool } from "app/models";
import { AddNodeUserAttributes, NodeService, NodeUserService } from "app/services";
import { DateUtils, PoolUtils, SecureUtils } from "app/utils";
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
    public get pool() { return this._pool; }

    @Input()
    public node: Node;

    private _pool: Pool;

    constructor(
        public sidebarRef: SidebarRef<any>,
        private nodeUserService: NodeUserService,
        private nodeService: NodeService) {
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
        this._loadConnectionData();
    }

    @autobind()
    public generateCredentials() {
        const credentials = {
            name: SecureUtils.username(),
            password: SecureUtils.password(),
            isAdmin: true,
        };

        return this.addOrUpdateUser(credentials).do(() => {
            this.credentialSource = CredentialSource.Generated;
        });
    }

    @autobind()
    public addOrUpdateUser(credentials) {
        return this.nodeUserService.addOrUpdateUser(this.pool.id, this.node.id, credentials).do(() => {
            this.credentials = credentials;
        });
    }

    public get sshCommand() {
        if (!this.connectionSettings || !this.credentials) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;
        return `ssh ${this.credentials.name}@${ip} -p ${port}`;
    }

    @autobind()
    public specifyCredentials() {
        this.credentialSource = CredentialSource.Specified;
    }

    @autobind()
    public goToHome() {
        this.credentialSource = null;
    }

    @autobind()
    public close() {
        this.sidebarRef.destroy();
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

    public get expireTime() {
        return this.credentials && DateUtils.prettyDate(this.credentials.expiryTime);
    }
}
