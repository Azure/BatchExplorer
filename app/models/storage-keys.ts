import { Record } from "immutable";

import { Partial } from "app/utils";

const StorageKeysRecord = Record({
    lastKeySync: null,
    primaryKey: null,
    secondaryKey: null,
});

export interface StorageKeysAttributes {
    lastKeySync: Date;
    primaryKey: string;
    secondaryKey: string;
}

/**
 * Class for storing storage account access keys returned from ARM /listkeys operation
 */
export class StorageKeys extends StorageKeysRecord implements StorageKeysAttributes {
    public lastKeySync: Date;
    public primaryKey: string;
    public secondaryKey: string;

    constructor(data: Partial<StorageKeysAttributes> = {}) {
        super(Object.assign({}, data, {  }));
    }
}
