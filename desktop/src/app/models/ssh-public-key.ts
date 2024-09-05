import { Model, Record, Prop } from "@batch-flask/core/record";
import { SecureUtils } from "@batch-flask/utils/secure-utils";

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
