import { Record } from "immutable";

const AccountKeysRecord = Record({
    accountName: null,
    primary: null,
    secondary: null,
});

export class AccountKeys extends AccountKeysRecord {
    public accountName: string;
    public primary: string;
    public secondary: string;
}
