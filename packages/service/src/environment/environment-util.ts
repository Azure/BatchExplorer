import {
    DependencyFactories,
    EnvironmentConfig,
    MockEnvironment,
    initEnvironment,
    mockDependencyFactories,
    mockEnvironmentConfig,
} from "@azure/bonito-core/lib/environment";
import { FakeNodeService } from "../node";
import { FakePoolService } from "../pool";
import { FakeTaskService } from "../task/fake-task-service";
import {
    BatchDependencyFactories,
    BatchDependencyName,
} from "./batch-dependencies";

export const mockBatchDepFactories: Partial<BatchDependencyFactories> = {
    [BatchDependencyName.PoolService]: () => new FakePoolService(),
    [BatchDependencyName.NodeService]: () => new FakeNodeService(),
    [BatchDependencyName.TaskService]: () => new FakeTaskService(),
};

/**
 * Initialize a global mock Batch browser environment.
 */
export function initMockBatchEnvironment(
    configOverrides: Partial<EnvironmentConfig> = {},
    depFactoryOverrides: Partial<DependencyFactories> = {}
): void {
    const config = { ...mockEnvironmentConfig, ...configOverrides };
    const depFactories = {
        ...mockDependencyFactories,
        ...mockBatchDepFactories,
        ...depFactoryOverrides,
    };
    initEnvironment(new MockEnvironment(config, depFactories));
}
