import { Record } from "immutable";

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
    },
});

export type AccountProvisingState = "Succeeded";
export const AccountProvisingState = {
    Succeeded: "Succeeded" as AccountProvisingState,
};

export interface AccountResourceProperties {
    accountEndpoint: string;
    activeJobAndJobScheduleQuota: number;
    coreQuota: number;
    poolQuota: number;
    provisioningState: AccountProvisingState;
}

export class AccountResource extends AccountRecord {
    public id: string;
    public name: string;
    public location: string;
    public type: string;
    public properties: AccountResourceProperties;
}
