import { DependencyFactories } from "@azure/bonito-core/lib/environment";
import { NodeService } from "../node";
import { PoolService } from "../pool";

export enum BatchDependencyName {
    PoolService = "poolService",
    NodeService = "nodeService",
}

export interface BatchDependencyFactories extends DependencyFactories {
    [BatchDependencyName.PoolService]: () => PoolService;
    [BatchDependencyName.NodeService]: () => NodeService;
}
