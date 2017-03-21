import { Record } from "immutable";

import { Subscription } from "./subscription";

const AccountRecord = Record({
    id: null,
    name: null,
    location: null,
    type: null,
    properties: {
        accountEndpoint: null,
        activeJobAndJobScheduleQuota: null,
        coreQuota: null,
        poolQuota: null,
        provisioningState: null,
        autoStorage: {
            storageAccountId: null,
            lastKeySync: null,
        },
    },
    subscription: null,
});

export type AccountProvisingState = "Succeeded";
export const AccountProvisingState = {
    Succeeded: "Succeeded" as AccountProvisingState,
};

export interface AutoStorageAccount {
    storageAccountId: string;
    lastKeySync: Date;
}

export interface AccountResourceProperties {
    accountEndpoint: string;
    provisioningState: AccountProvisingState;
    coreQuota: number;
    poolQuota: number;
    activeJobAndJobScheduleQuota: number;
    autoStorage: AutoStorageAccount;
}

export class AccountResource extends AccountRecord {
    public id: string;
    public name: string;
    public location: string;
    public type: string;
    public properties: AccountResourceProperties;
    public subscription: Subscription;
}
