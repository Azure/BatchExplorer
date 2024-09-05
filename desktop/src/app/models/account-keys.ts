import { Model, Record, Prop } from "@batch-flask/core/record";

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
