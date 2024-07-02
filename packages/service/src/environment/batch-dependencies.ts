import { DependencyFactories } from "@azure/bonito-core/lib/environment";
import { NodeService } from "../node";
import { PoolService } from "../pool";
import { AccountService } from "../account";

export enum BatchDependencyName {
    PoolService = "poolService",
    NodeService = "nodeService",
    AccountService = "accountService",
}

export interface BatchDependencyFactories extends DependencyFactories {
    [BatchDependencyName.PoolService]: () => PoolService;
    [BatchDependencyName.NodeService]: () => NodeService;
    [BatchDependencyName.AccountService]: () => AccountService;
}
