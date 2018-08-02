import { Component, Input, OnChanges } from "@angular/core";

import { EntityView } from "@batch-flask/core";
import { FileExplorerConfig } from "@batch-flask/ui";
import { JobHookTask, Node } from "app/models";
import { NodeParams, NodeService } from "app/services";
import "./job-hook-task-details.scss";

@Component({
    selector: "bl-job-hook-task-details",
    templateUrl: "job-hook-task-details.html",
})
export class JobHookTaskDetailsComponent implements OnChanges {
    @Input() public task: JobHookTask;
    @Input() public type: string = "preparationTask";
    public node: Node;
    public loading = true;

    public fileExplorerConfig: FileExplorerConfig = {
        showTreeView: false,
    };

    private _nodeData: EntityView<Node, NodeParams>;

    constructor(nodeService: NodeService) {
        this._nodeData = nodeService.view();
        this._nodeData.item.subscribe((node) => {
            this.node = node;
        });
    }

    public ngOnChanges(changes) {
        if (changes.task) {
            this._nodeData.params = {
                poolId: this.task.poolId,
                id: this.task.nodeId,
            };
            this._nodeData.fetch().subscribe({
                next: () => {
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
        }

    }

    public get currentFolder() {
        const info = this.task[this.type];
        return info && info.taskRootDirectory;
    }
}
