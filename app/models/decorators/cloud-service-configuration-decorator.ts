import { CloudServiceConfiguration } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class CloudServiceConfigurationDecorator extends DecoratorBase<CloudServiceConfiguration> {
    public osFamily: string;
    public targetOSVersion: string;
    public currentOSVersion: string;

    constructor(cloudServiceConfiguration: CloudServiceConfiguration) {
        super(cloudServiceConfiguration);

        this.osFamily = this.stringField(cloudServiceConfiguration.osFamily);
        this.targetOSVersion = this.stringField(cloudServiceConfiguration.targetOSVersion);
        this.currentOSVersion = this.stringField(cloudServiceConfiguration.currentOSVersion);
    }
}
