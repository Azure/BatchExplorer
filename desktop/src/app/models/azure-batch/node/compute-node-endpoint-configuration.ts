import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { InboundEndpointProtocol } from "../../pool-endpoint-configuration";

export interface InboundEndpointAttributes {
    backendPort: number;
    frontendPort: number;
    name: string;
    protocol: InboundEndpointProtocol;
    publicFQDN: string;
    publicIPAddress: string;
}

@Model()
export class InboundEndpoint extends Record<InboundEndpointAttributes> {
    @Prop() public backendPort: number;
    @Prop() public frontendPort: number;
    @Prop() public name: string;
    @Prop() public protocol: InboundEndpointProtocol;
    @Prop() public publicFQDN: string;
    @Prop() public publicIPAddress: string;
}

export interface ComputeNodeEndpointConfigurationAttributes {
    inboundEndpoints: InboundEndpointAttributes[];
}

@Model()
export class ComputeNodeEndpointConfiguration extends Record<ComputeNodeEndpointConfigurationAttributes> {
    @ListProp(InboundEndpoint) public inboundEndpoints: List<InboundEndpoint> = List([]);
}
