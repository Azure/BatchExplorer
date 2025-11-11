import { OperationOptions } from "@azure/bonito-core";
import { LegacyPool, LegacyPoolOutput, Pool, PoolOutput } from "./pool-models";

export interface PoolService {
    /**
     * Creates or updates a pool.
     *
     * @param poolResourceId The ARM resource ID of the pool.
     * @param pool The pool to create or update.
     * @returns The created/updated pool.
     */
    createOrUpdate(poolResourceId: string, pool: Pool): Promise<PoolOutput>;

    /**
     * Get a pool by its resource ID.
     *
     * @param poolResourceId The ARM resource ID of the pool.
     * @param opts Optional operation parameters.
     * @returns The pool, or undefined if not found.
     */
    get(
        poolResourceId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput | undefined>;

    /**
     * Get a pool by its resource ID using the 2024-07-01 API version.
     *
     * @param poolResourceId The ARM resource ID of the pool.
     * @param opts Optional operation parameters.
     * @returns The pool, or undefined if not found.
     */
    getLegacy(
        poolResourceId: string,
        opts?: OperationOptions
    ): Promise<LegacyPoolOutput | undefined>;

    /**
     * List pools by Batch account resource ID.
     * @param accountId The ARM resource ID of the Batch account.
     * @param opts Optional operation parameters.
     * @returns The list of pools.
     */
    listByAccountId(
        accountId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput[]>;

    /**
     * Updates specified properties of a pool.
     *
     * @param poolResourceId The ARM resource ID of the pool.
     * @param pool A partial pool with the properties to update.
     * @param opts Optional operation parameters.
     * @returns The updated pool.
     */
    patch(
        poolResourceId: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput>;

    /**
     * Updates specified properties of a pool using the 2024-07-01 API version.
     *
     * @param poolResourceId The ARM resource ID of the pool.
     * @param pool A partial pool with the properties to update.
     * @param opts Optional operation parameters.
     * @returns The updated pool.
     */
    patchLegacy(
        poolResourceId: string,
        pool: LegacyPool,
        opts?: OperationOptions
    ): Promise<LegacyPoolOutput>;
}
