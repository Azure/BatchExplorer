import type { ListPoolsResultOutput, Pool, PoolOutput } from "./pool-models";
import type { PoolService } from "./pool-service";
import { AbstractHttpService } from "../http-service";
import {
    getHttpClient,
    StandardHttpHeaders,
    MediaType,
} from "@batch/ui-common";
import { ApiVersion, Endpoints } from "../constants";
import { OperationOptions, buildRequestMetadata } from "../operations";
import { UnexpectedStatusCodeError } from "../errors";

export class LivePoolService
    extends AbstractHttpService
    implements PoolService
{
    async createOrUpdate(
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput> {
        const response = await getHttpClient().put(
            `${Endpoints.arm}${pool.id}?api-version=${ApiVersion.batch.arm}`,
            {
                body: JSON.stringify(pool),
                metadata: buildRequestMetadata(opts),
            }
        );

        if (response.status === 200) {
            return (await response.json()) as PoolOutput;
        }

        throw new UnexpectedStatusCodeError(
            `Failed to create or update pool ${pool.id}`,
            response.status,
            await response.text()
        );
    }

    async get(
        id: string,
        opts?: OperationOptions
    ): Promise<PoolOutput | undefined> {
        const response = await getHttpClient().get(
            `${Endpoints.arm}${id}?api-version=${ApiVersion.batch.arm}`,
            {
                metadata: buildRequestMetadata(opts),
            }
        );

        if (response.status === 404) {
            return undefined;
        }

        if (response.status === 200) {
            return (await response.json()) as PoolOutput;
        }

        throw new UnexpectedStatusCodeError(
            `Failed to get pool by ID ${id}`,
            response.status,
            await response.text()
        );
    }

    async listByAccountId(
        accountId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput[]> {
        const response = await getHttpClient().get(
            `${Endpoints.arm}${accountId}/pools?api-version=${ApiVersion.batch.arm}`,
            {
                metadata: buildRequestMetadata(opts),
            }
        );

        if (response.status === 200) {
            const json = (await response.json()) as ListPoolsResultOutput;
            return json.value ?? [];
        }

        throw new UnexpectedStatusCodeError(
            `Failed to list pools under account ${accountId}`,
            response.status,
            await response.text()
        );
    }

    async patch(pool: Pool, opts?: OperationOptions): Promise<PoolOutput> {
        if (!pool.id) {
            throw new Error("Pool ID must be defined");
        }

        const response = await getHttpClient().patch(
            `${Endpoints.arm}${pool.id}?api-version=${ApiVersion.batch.arm}`,
            {
                headers: {
                    [StandardHttpHeaders.ContentType]: MediaType.Json,
                },
                body: JSON.stringify(pool),
                metadata: buildRequestMetadata(opts),
            }
        );

        if (response.status === 200) {
            return (await response.json()) as PoolOutput;
        }

        throw new UnexpectedStatusCodeError(
            `Failed to patch pool ${pool.id}`,
            response.status,
            await response.text()
        );
    }
}
