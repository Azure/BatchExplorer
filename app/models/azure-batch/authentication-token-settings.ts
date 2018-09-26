import { ListProp, Model, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface AuthenticationTokenSettingsAttributes {
    access: string[];
}

@Model()
export class AuthenticationTokenSettings extends Record<AuthenticationTokenSettingsAttributes> {
    @ListProp(String) public access: List<string> = List([]);
}
