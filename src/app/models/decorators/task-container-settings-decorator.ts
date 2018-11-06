import { TaskContainerSettings } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class TaskContainerSettingsDecorator extends DecoratorBase<TaskContainerSettings> {
    public propertyCount: number;
    public imageName: string;
    public containerRunOptions: string;
    public registryUsername: string;
    public registryServer: string;

    constructor(containerSettings: TaskContainerSettings) {
        super(containerSettings);

        this.propertyCount = Object.keys(containerSettings).length;
        this.imageName = this.stringField(containerSettings.imageName);
        this.containerRunOptions = this.stringField(containerSettings.containerRunOptions);
        this.registryUsername = this.stringField(containerSettings.registry ?
            containerSettings.registry.username : null);
        this.registryServer = this.stringField(containerSettings.registry ?
            containerSettings.registry.registryServer : null);
    }
}
