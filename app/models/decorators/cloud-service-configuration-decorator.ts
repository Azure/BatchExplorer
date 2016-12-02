import { DecoratorBase } from "../../utils/decorators";
import { CloudServiceConfiguration } from "../cloudServiceConfiguration";

export class CloudServiceConfigurationDecorator extends DecoratorBase<CloudServiceConfiguration> {
    public osFamily: string;
    public targetOSVersion: string;
    public currentOSVersion: string;

    constructor(private cloudServiceConfiguration: CloudServiceConfiguration) {
        super(cloudServiceConfiguration);

        this.osFamily = this.stringField(cloudServiceConfiguration.osFamily);
        this.targetOSVersion = this.stringField(cloudServiceConfiguration.targetOSVersion);
        this.currentOSVersion = this.stringField(cloudServiceConfiguration.currentOSVersion);
    }
}
