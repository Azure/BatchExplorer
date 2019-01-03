import { Model, Prop, Record } from "@batch-flask/core";

interface NodeUserAttributes {
    name: string;
    isAdmin: boolean;
    expiryTime: Date;
    password: string;
    sshPublicKey: string;
}

@Model()
export class NodeUser extends Record<NodeUserAttributes> {
    @Prop() public name: string;
    @Prop() public isAdmin: boolean;
    @Prop() public expiryTime: Date;
    @Prop() public password: string;
    @Prop() public sshPublicKey: string;
}
