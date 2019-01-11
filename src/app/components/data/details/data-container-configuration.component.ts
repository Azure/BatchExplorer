import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { ContainerDecorator } from "app/decorators";
import { BlobContainer } from "app/models";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-data-container-configuration",
    templateUrl: "data-container-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataContainerConfigurationComponent implements OnChanges {
    @Input() public container: BlobContainer;

    public decorator: ContainerDecorator = {} as any;


    public ngOnChanges(changes) {
        if (changes.container) {
            if (this.container) {
                this.decorator = new ContainerDecorator(this.container);
            }
        }
    }
}
