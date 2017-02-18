import { Record } from "immutable";

interface NodeUserAttributes {
    name: string;
    isAdmin: boolean;
    expiryTime: Date;
    password: string;
    sshPublicKey: string;
}

const NodeUserRecord = Record({
    name: null,
    isAdmin: false,
    expiryTime: null,
    password: null,
    sshPublicKey: null,
});

export class NodeUser extends NodeUserRecord {
    constructor(data: Partial<NodeUserAttributes>) {
        super(data);
    }
}
