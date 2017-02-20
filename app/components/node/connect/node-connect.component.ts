import { Component, Input, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { remote, shell } from "electron";
import * as fs from "fs";
import { List } from "immutable";
import * as path from "path";
import * as mkdirp from "mkdirp";
import { AsyncSubject, Observable } from "rxjs";

import { Node, NodeAgentSku, Pool } from "app/models";
import { AccountService, NodeUserService } from "app/services";
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

    constructor(private accountService: AccountService, private nodeUserService: NodeUserService) {
    }

    public ngOnInit() {
        const data = this.accountService.listNodeAgentSkus();
        data.fetchAll().subscribe(() => {
            data.items.first().subscribe((agentSkus) => {
                this.agentSkus = agentSkus;
                this.windows = PoolUtils.isWindows(this.pool, agentSkus);
            });
        });
        this.nodeUserService.getRemoteDesktop(this.pool.id, this.node.id).subscribe((rdp) => {
            this.rdpContent = rdp.content.toString();
        });
    }

    @autobind()
    public generateCredentials() {
        const credentials = {
            username: SecureUtils.username(),
            password: SecureUtils.password(),
        };
        return this.nodeUserService.addOrUpdateUser(this.pool.id, this.node.id, {
            name: credentials.username,
            password: credentials.password,
            isAdmin: true,
        }).do(() => {
            this.credentialSource = CredentialSource.Generated;
            this.credentials = credentials;
        });
    }

    @autobind()
    public specifyCredentials() {
        this.credentialSource = CredentialSource.Specified;
    }
}
