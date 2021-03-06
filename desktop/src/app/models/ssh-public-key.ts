import { Model, Prop, Record } from "@batch-flask/core";
import { SecureUtils } from "@batch-flask/utils";

export interface SSHPublicKeyAttributes {
    id: string;
    name: string;
    value: string;
}

@Model()
export class SSHPublicKey extends Record<SSHPublicKeyAttributes> {
    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public value: string;

    constructor(data: Partial<SSHPublicKeyAttributes>) {
        super({
            id: SecureUtils.uuid(),
            ...data,
        });
    }
}
