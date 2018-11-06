import { ContainerConfiguration, ContainerRegistry } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class ContainerConfigurationDecorator extends DecoratorBase<ContainerConfiguration> {
    public type: string;
    public containerImageNames: string;
    public containerRegistries: ContainerRegistry[];

    constructor(containerConfiguration: ContainerConfiguration) {
        super(containerConfiguration);
        this.type = this.stringField(containerConfiguration.type);
        this.containerImageNames = this.stringField(containerConfiguration.containerImageNames.join(";"));
        this.containerRegistries = containerConfiguration.containerRegistries.toArray();
    }
}
