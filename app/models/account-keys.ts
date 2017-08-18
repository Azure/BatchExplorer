import { Model, Prop, Record } from "app/core";

export interface AccountKeysAttributes {
    accountName: string;
    primary: string;
    secondary: string;
}

@Model()
export class AccountKeys extends Record<AccountKeysAttributes> {
    @Prop() public accountName: string;
    @Prop() public primary: string;
    @Prop() public secondary: string;
}
