import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { Node, NodeSchedulingState } from "app/models";
import { NodeService, PoolService } from "app/services";
import { forkJoin } from "rxjs";
import { flatMap, switchMap } from "rxjs/operators";
import { NodeConnectComponent } from "../connect";

@Injectable()
export class NodeCommands extends EntityCommands<Node> {
    public connect: EntityCommand<Node, void>;
    public delete: EntityCommand<Node, void>;
    public reboot: EntityCommand<Node, void>;
    public reimage: EntityCommand<Node, void>;
    public editStartTask: EntityCommand<Node, void>;
    public uploadLog: EntityCommand<Node, void>;
    public disableScheduling: EntityCommand<Node, void>;
    public enableScheduling: EntityCommand<Node, void>;

    constructor(
        injector: Injector,
        private poolService: PoolService,
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
            multiple: (nodes: Node[]) => this._deleteMultiple(nodes),
        });

        this.reboot = this.simpleCommand({
            name: "reboot",
            ...COMMAND_LABEL_ICON.RebootNode,
            action: (node: Node) => this._reboot(node),
            permission: Permission.Write,
        });

        this.reimage = this.simpleCommand({
            name: "reimage",
            icon: "fa fa-hdd-o",
            label: "Reimage",
            action: (node: Node) => this._reimage(node),
            permission: Permission.Write,
        });

        this.disableScheduling = this.simpleCommand({
            name: "disableScheduling",
            label: "Disable scheduling",
            icon: "fa fa-stop",
            visible: (node: Node) => node.schedulingState === NodeSchedulingState.Enabled,
            enabled: (node: Node) => node.schedulingState === NodeSchedulingState.Enabled,
            action: (node: Node) => this._disableScheduling(node),
            permission: Permission.Write,
        });

        this.enableScheduling = this.simpleCommand({
            name: "enableScheduling",
            label: "Re-enable scheduling",
            icon: "fa fa-play",
            visible: (node: Node) => node.schedulingState === NodeSchedulingState.Disabled,
            enabled: (node: Node) => node.schedulingState === NodeSchedulingState.Disabled,
            action: (node: Node) => this._enableScheduling(node),
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
            this.reimage,
            this.disableScheduling,
            this.enableScheduling,
            this.editStartTask,
        ];
    }

    private _connect(node: Node) {
        this.poolService.getFromCache(this.params["poolId"]).subscribe((pool) => {
            const ref = this.sidebarManager.open(`connect-node-${node.id}`, NodeConnectComponent);
            ref.component.node = node;
            ref.component.pool = pool;
        });
    }

    private _reboot(node: Node) {
        return this.nodeService.reboot(this.params["poolId"], node.id).pipe(
            flatMap(() => this.nodeService.get(this.params["poolId"], node.id)),
        );
    }

    private _reimage(node: Node) {
        return this.nodeService.reimage(this.params["poolId"], node.id);
    }

    private _delete(node: Node) {
        return this.nodeService.delete(this.params["poolId"], node.id).pipe(
            switchMap(() => this.nodeService.get(this.params["poolId"], node.id)),
        );
    }

    private _deleteMultiple(nodes: Node[]) {
        const nodeIds = nodes.map(x => x.id);
        return this.nodeService.delete(this.params["poolId"], nodeIds).pipe(
            switchMap(() => {
                return forkJoin(nodes.map(x => this.nodeService.get(this.params["poolId"], x.id)));
            }),
        );
    }

    private _disableScheduling(node: Node) {
        return this.nodeService.disableScheduling(this.params["poolId"], node.id).pipe(
            flatMap(() => this.nodeService.get(this.params["poolId"], node.id)),
        );
    }

    private _enableScheduling(node: Node) {
        return this.nodeService.enableScheduling(this.params["poolId"], node.id).pipe(
            flatMap(() => this.nodeService.get(this.params["poolId"], node.id)),
        );
    }

    private _editStartTask(node: Node) {
        this.poolService.getFromCache(this.params["poolId"]).subscribe((pool) => {
            const ref = this.sidebarManager.open(`edit-start-task-${this.params["poolId"]}`,
                StartTaskEditFormComponent);
            ref.component.pool = pool;
            ref.component.fromNode = node.id;
        });
    }
}
