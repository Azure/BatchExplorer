import { DecoratorBase } from "../../utils/decorators";
import { WindowsConfiguration } from "../windowsConfiguration";

export class WindowsConfigurationDecorator extends DecoratorBase<WindowsConfiguration> {
    public enableAutomaticUpdates: string;

    constructor(private windowsConfiguration: WindowsConfiguration) {
        super(windowsConfiguration);

        this.enableAutomaticUpdates = this.booleanField(
            windowsConfiguration.enableAutomaticUpdates);
    }
}
