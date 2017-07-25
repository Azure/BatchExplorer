import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { BlobContainer } from "app/models";
import { ContainerDecorator } from "app/models/decorators";

@Component({
    selector: "bl-data-container-configuration",
    templateUrl: "data-container-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataContainerConfigurationComponent {
    @Input()
    public set container(container: BlobContainer) {
        this._container = container;
        this.refresh(container);
    }
    public get application() { return this._container; }

    public decorator: ContainerDecorator = {} as any;

    private _container: BlobContainer;

    public refresh(container: BlobContainer) {
        if (container) {
            this.decorator = new ContainerDecorator(container);
        }
    }
}
