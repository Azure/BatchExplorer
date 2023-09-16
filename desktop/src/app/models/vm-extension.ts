import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface VMExtensionAttributes {
    name: string,
    publisher: string,
    type: string,
    typeHandlerVersion: string,
    autoUpgradeMinorVersion: boolean,
    enableAutomaticUpgrade: boolean,
    // settings: any, // TODO: swagger says this should be an object but doesn't specify properties?
    // protectedSettings: any, // TODO: swagger says this should be an object but doesn't specify properties?
    provisionAfterExtensions: string[],
}

@Model()
export class VMExtension extends Record<VMExtensionAttributes> {
    @Prop() public name: string;
    @Prop() public publisher: string;
    @Prop() public type: string;
    @Prop() public typeHandlerVersion: string;
    @Prop() public autoUpgradeMinorVersion: boolean;
    @Prop() public enableAutomaticUpgrade: boolean;
    // @Prop() public settings: any;
    // @Prop() public protectedSettings: any;
    @ListProp(String) public provisionAfterExtensions: List<string>;
}
