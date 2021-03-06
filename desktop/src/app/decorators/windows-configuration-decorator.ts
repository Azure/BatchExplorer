import { WindowsConfiguration } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class WindowsConfigurationDecorator extends DecoratorBase<WindowsConfiguration> {
    public enableAutomaticUpdates: string;

    constructor(windowsConfiguration: WindowsConfiguration) {
        super(windowsConfiguration);

        this.enableAutomaticUpdates = this.booleanField(
            windowsConfiguration.enableAutomaticUpdates);
    }
}
