import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { Node, Pool } from "app/models";
import { NodeService, PoolParams } from "app/services";
import { EntityView } from "@batch-flask/core";
import { flatMap } from "rxjs/operators";
import { NodeConnectComponent } from "../connect";

@Injectable()
export class NodeCommands extends EntityCommands<Node> {
    public connect: EntityCommand<Node, void>;
    public delete: EntityCommand<Node, void>;
    public reboot: EntityCommand<Node, void>;
    public editStartTask: EntityCommand<Node, void>;
    public uploadLog: EntityCommand<Node, void>;

    public pool: Pool;
    public poolData: EntityView<Pool, PoolParams>;

    constructor(
        injector: Injector,
        private nodeService: NodeService,
        private sidebarManager: SidebarManager) {
        super(
            injector,
            "Node",
        );
        this._buildCommands();
    }

    public get(nodeId: string) {
        return this.nodeService.get(this.params["poolId"], nodeId);
    }

    public getFromCache(nodeId: string) {
        return this.nodeService.getFromCache(this.params["poolId"], nodeId);
    }

    private _buildCommands() {
        this.connect = this.simpleCommand({
            name: "connect",
            ...COMMAND_LABEL_ICON.ConnectToNode,
            action: (node) => this._connect(node),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.delete = this.simpleCommand({
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (node: Node) => this._delete(node),
            permission: Permission.Write,
        });

        this.reboot = this.simpleCommand({
            name: "reboot",
            ...COMMAND_LABEL_ICON.RebootNode,
            action: (node: Node) => this._reboot(node),
            permission: Permission.Write,
        });

        this.editStartTask = this.simpleCommand({
            name: "editStartTask",
            ...COMMAND_LABEL_ICON.EditStartTask,
            action: (node) => this._editStartTask(node),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.commands = [
            this.connect,
            this.delete,
            this.reboot,
            this.editStartTask,
        ];
    }

    private _connect(node: Node) {
        const ref = this.sidebarManager.open(`connect-node-${node.id}`, NodeConnectComponent);
        ref.component.node = node;
        ref.component.pool = this.pool;
    }

    private _reboot(node: Node) {
        return this.nodeService.reboot(this.pool.id, node.id).pipe(
            flatMap(() => this.nodeService.get(this.pool.id, node.id)),
        );
    }

    private _delete(node: Node) {
        return this.nodeService.delete(this.pool.id, node.id).pipe(
            flatMap(() => this.nodeService.get(this.pool.id, node.id)),
        );
    }

    private _editStartTask(node: Node) {
        const ref = this.sidebarManager.open(`edit-start-task-${this.pool.id}`, StartTaskEditFormComponent);
        ref.component.pool = this.pool;
        ref.component.fromNode = node.id;
    }
}
