import { Record } from "immutable";

import { Partial } from "app/utils";

const StorageKeysRecord = Record({
    primaryKey: null,
    secondaryKey: null,
});

export interface StorageKeysAttributes {
    primaryKey: string;
    secondaryKey: string;
}

/**
 * Class for storing storage account access keys returned from ARM /listkeys operation
 */
export class StorageKeys extends StorageKeysRecord implements StorageKeysAttributes {
    public primaryKey: string;
    public secondaryKey: string;

    constructor(data: Partial<StorageKeysAttributes> = {}) {
        super(Object.assign({}, data, {  }));
    }
}
