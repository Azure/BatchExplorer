import { Prop, Model, Record } from "app/core";

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
