import { Model, Prop, Record } from "app/core";

export interface NodeConnectionSettingsAttributes {
    remoteLoginIPAddress: string;
    remoteLoginPort: number;
}

@Model()
export class NodeConnectionSettings extends Record<NodeConnectionSettingsAttributes> {
    @Prop() public remoteLoginIPAddress: string;
    @Prop() public remoteLoginPort: number;

    public get ip() { return this.remoteLoginIPAddress; }
    public get port() { return this.remoteLoginPort; }
}
