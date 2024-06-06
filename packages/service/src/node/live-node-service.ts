import {
    AbstractHttpService,
    CustomHttpHeaders,
    OperationOptions,
} from "@azure/bonito-core";
import { BatchNodeOutput, BatchNodeVMExtensionOutput } from "./node-models";
import { ListNodesOptions, NodeService } from "./node-service";
import {
    createBatchClient,
    isUnexpected,
    paginate,
} from "../internal/batch-rest";
import { createBatchUnexpectedStatusCodeError } from "../utils";
import { PagedAsyncIterableIterator } from "@azure/core-paging";

export class LiveNodeService
    extends AbstractHttpService
    implements NodeService
{
    private _ensureHttpsEndpoint(accountEndpoint: string): string {
        if (!accountEndpoint.startsWith("https://")) {
            return `https://${accountEndpoint}`;
        }

        return accountEndpoint;
    }

    async getNode(
        accountEndpoint: string,
        poolName: string,
        nodeId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeOutput> {
        const batchClient = createBatchClient(
            this._ensureHttpsEndpoint(accountEndpoint)
        );

        const res = await batchClient
            .path("/pools/{poolId}/nodes/{nodeId}", poolName, nodeId)
            .get({
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "GetNode",
                },
            });

        if (isUnexpected(res)) {
            throw createBatchUnexpectedStatusCodeError(res);
        }

        return res.body;
    }

    async listNodes(
        accountEndpoint: string,
        poolName: string,
        opts?: ListNodesOptions
    ): Promise<PagedAsyncIterableIterator<BatchNodeOutput>> {
        const listNodePath = "/pools/{poolId}/nodes";
        const batchClient = createBatchClient(
            this._ensureHttpsEndpoint(accountEndpoint)
        );
        const res = await batchClient.path(listNodePath, poolName).get({
            queryParameters: {
                $filter: opts?.filter,
            },
            headers: {
                [CustomHttpHeaders.CommandName]:
                    opts?.commandName ?? "ListNodes",
            },
        });

        if (isUnexpected(res)) {
            throw createBatchUnexpectedStatusCodeError(res);
        }

        return paginate(batchClient, res);
    }

    async listVmExtensions(
        accountEndpoint: string,
        poolName: string,
        nodeId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeVMExtensionOutput[]> {
        const listNodeExtensionPath =
            "/pools/{poolId}/nodes/{nodeId}/extensions";
        const batchClient = createBatchClient(
            this._ensureHttpsEndpoint(accountEndpoint)
        );
        const res = await batchClient
            .path(listNodeExtensionPath, poolName, nodeId)
            .get({
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "ListNodeVmExtensions",
                },
            });

        if (isUnexpected(res)) {
            throw createBatchUnexpectedStatusCodeError(res);
        }

        return res.body.value ?? [];
    }
}
