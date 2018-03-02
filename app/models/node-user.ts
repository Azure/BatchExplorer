import { Model, Prop, Record } from "@bl-common/core";

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
