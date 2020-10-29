import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface PublicIPAddressConfigurationAttributes {
    ipAddressIds: string[];
    provision: string;
}

/**
 * Class for displaying the public IP address configuration for the pool.
 */
@Model()
export class PublicIPAddressConfiguration extends Record<PublicIPAddressConfiguration> {
    @ListProp(String) public ipAddressIds: List<String>;
    @Prop() public provision: string;
}
