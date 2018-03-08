import { Model, Prop, Record } from "@batch-flask/core";

export interface CloudServiceConfigurationAttributes {
    osFamily: CloudServiceOsFamily;
    targetOSVersion: string;
    currentOSVersion: string;
}
/**
 * Class for displaying Batch CloudServiceConfiguration information.
 */
@Model()
export class CloudServiceConfiguration extends Record<CloudServiceConfigurationAttributes> {
    @Prop() public osFamily: CloudServiceOsFamily;
    @Prop() public targetOSVersion: string;
    @Prop() public currentOSVersion: string;
}

export enum CloudServiceOsFamily {
    windowsServer2008R2 = "2",
    windowsServer2012 = "3",
    windowsServer2012R2 = "4",
    windowsServer2016 = "5",
}
