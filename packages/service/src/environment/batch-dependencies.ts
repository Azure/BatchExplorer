import { DependencyFactories } from "@azure/bonito-core/lib/environment";
import { NodeService } from "../node";
import { PoolService } from "../pool";
import { SkuService } from "../sku";

export enum BatchDependencyName {
    PoolService = "poolService",
    NodeService = "nodeService",
    SkuService = "skuService",
}

export interface BatchDependencyFactories extends DependencyFactories {
    [BatchDependencyName.PoolService]: () => PoolService;
    [BatchDependencyName.NodeService]: () => NodeService;
    [BatchDependencyName.SkuService]: () => SkuService;
}
