import { Model, Prop, Record } from "@batch-flask/core";

export interface DNSSettings {
    domainNameLabel: string;
    fqdn: string;
    reverseFqdn: string;
}

export interface PublicIPPrefix {
    id: string;
}

export interface PublicIPAttributes {
    publicIPAllocationMethod: string;
    publicIPAddressVersion: string;
    dnsSettings: DNSSettings;
    ipAddress: string;
    idleTimeoutInMinutes: number;
    resourceGuid: string;
}

@Model()
export class PublicIP extends Record<PublicIPAttributes> {
    @Prop() public publicIPAllocationMethod: string;
    @Prop() public publicIPAddressVersion: string;
    @Prop() public dnsSettings: DNSSettings;
    @Prop() public ipAddress: string;
    @Prop() public idleTimeoutInMinutes: number;
    @Prop() public resourceGuid: string;
}
