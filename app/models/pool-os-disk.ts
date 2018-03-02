import { Model, Prop, Record } from "@batch-flask/core";

export interface PoolOSDiskAttributes {
    caching: string;
    imageUris?: string[];
}

@Model()
export class PoolOSDisk extends Record<PoolOSDiskAttributes> {
    @Prop() public caching: string;
}
