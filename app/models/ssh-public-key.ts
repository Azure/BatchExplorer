import { Record } from "immutable";

import { SecureUtils } from "app/utils";

const SSHPublicKeyRecord = Record({
    id: null,
    name: null,
    value: null,
});

export interface SSHPublicKeyAttributes {
    id: string;
    name: string;
    value: string;
}
export class SSHPublicKey extends SSHPublicKeyRecord implements SSHPublicKeyAttributes {
    public id: string;
    public name: string;
    public value: string;

    constructor(data: Partial<SSHPublicKeyAttributes>) {
        super(Object.assign({}, {
            id: SecureUtils.uuid(),
        }, data));
    }
}
