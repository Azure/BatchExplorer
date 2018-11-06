import { CloudServiceConfiguration, CloudServiceOsFamily } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class CloudServiceConfigurationDecorator extends DecoratorBase<CloudServiceConfiguration> {
    public osFamily: string;
    public targetOSVersion: string;
    public currentOSVersion: string;

    constructor(cloudServiceConfiguration: CloudServiceConfiguration, osName: string) {
        super(cloudServiceConfiguration);

        this.osFamily = this._translateOSFamily(osName, cloudServiceConfiguration.osFamily);
        this.targetOSVersion = this.stringField(cloudServiceConfiguration.targetOSVersion);
        this.currentOSVersion = this.stringField(cloudServiceConfiguration.currentOSVersion);
    }

    private _translateOSFamily(osName: string, osFamilyId: CloudServiceOsFamily): string {
        return `${osName}, (ID: ${osFamilyId})`;
    }
}
