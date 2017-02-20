import { Record } from "immutable";

import { Partial } from "app/utils";

const NodeConnectionSettingsRecord = Record({
    remoteLoginIPAddress: null,
    remoteLoginPort: null,
});

export interface NodeConnectionSettingsAttributes {
    remoteLoginIPAddress: string;
    remoteLoginPort: number;

}

export class NodeConnectionSettings extends NodeConnectionSettingsRecord implements NodeConnectionSettingsAttributes {
    public remoteLoginIPAddress: string;
    public remoteLoginPort: number;

    public get ip() { return this.remoteLoginIPAddress; };
    public get port() { return this.remoteLoginPort; };

    constructor(attrs: Partial<NodeConnectionSettingsAttributes> = {}) {
        super(attrs);
    }
}
