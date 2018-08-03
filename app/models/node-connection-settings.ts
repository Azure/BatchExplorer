import { Model, Prop, Record } from "@batch-flask/core";

export interface IaasNodeConnectionSettingsAttributes {
    remoteLoginIPAddress: string;
    remoteLoginPort: number;
}

@Model()
export class IaasNodeConnectionSettings extends Record<IaasNodeConnectionSettingsAttributes> {
    @Prop() public remoteLoginIPAddress: string;
    @Prop() public remoteLoginPort: number;

    public get ip() { return this.remoteLoginIPAddress; }
    public get port() { return this.remoteLoginPort; }
}

export enum ConnectionType {
    RDP,
    SSH,
}

export interface NodeConnectionSettingsAttributes {
    port: number;
    ip: string;
    type: ConnectionType;
}

@Model()
export class NodeConnectionSettings extends IaasNodeConnectionSettings {
    @Prop() public remoteLoginType: ConnectionType;
    @Prop() public remoteLoginLoadBalanceInfo: string;

    public get type() { return this.remoteLoginType; }
    public get loadBalanceInfo() { return this.remoteLoginLoadBalanceInfo; }
}
