import { Model, Prop, Record } from "@batch-flask/core";

export interface FakeModelAttributes {
    id: string;
    state: string;
    name: string;
}

@Model()
export class FakeModel extends Record<FakeModelAttributes> {
    @Prop() public id: string;
    @Prop() public state: string;
    @Prop() public name: string;
}

export interface FakeParams {
    id: string;
}
