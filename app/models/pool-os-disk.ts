import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";

export interface PoolOSDiskAttributes {
    caching: string;
    imageUris?: string[];
}

@Model()
export class PoolOSDisk extends Record<PoolOSDiskAttributes> {
    @Prop() public caching: string;
    @ListProp(String) public imageUris: List<string> = List([]);
}
