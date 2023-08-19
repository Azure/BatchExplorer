import { BatchApiVersion } from "../constants";
import type { ListPoolsResultOutput, Pool, PoolOutput } from "./pool-models";
import type { PoolService } from "./pool-service";
import {
    getHttpClient,
    StandardHttpHeaders,
    MediaType,
    AbstractHttpService,
    OperationOptions,
    getArmUrl,
    buildRequestMetadata,
    UnexpectedStatusCodeError,
} from "@azure/bonito-core";

export class LivePoolService
    extends AbstractHttpService
    implements PoolService
{
    async createOrUpdate(
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput> {
        const response = await getHttpClient().put(
            `${getArmUrl()}${pool.id}?api-version=${BatchApiVersion.arm}`,
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
            `${getArmUrl()}${id}?api-version=${BatchApiVersion.arm}`,
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
            `${getArmUrl()}${accountId}/pools?api-version=${
                BatchApiVersion.arm
            }`,
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
            `${getArmUrl()}${pool.id}?api-version=${BatchApiVersion.arm}`,
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
