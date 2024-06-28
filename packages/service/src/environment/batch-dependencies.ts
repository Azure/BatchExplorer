import { DependencyFactories } from "@azure/bonito-core/lib/environment";
import { NodeService } from "../node";
import { PoolService } from "../pool";
import { TaskService } from "../task/task-service";

export enum BatchDependencyName {
    PoolService = "poolService",
    NodeService = "nodeService",
    TaskService = "taskService",
}

export interface BatchDependencyFactories extends DependencyFactories {
    [BatchDependencyName.PoolService]: () => PoolService;
    [BatchDependencyName.NodeService]: () => NodeService;
    [BatchDependencyName.TaskService]: () => TaskService;
}
