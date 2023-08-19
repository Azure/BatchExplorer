import { DependencyFactories } from "@azure/bonito-core/lib/environment";
import { PoolService } from "../pool";

export enum BatchDependencyName {
    PoolService = "poolService",
}

export interface BatchDependencyFactories extends DependencyFactories {
    [BatchDependencyName.PoolService]: () => PoolService;
}
