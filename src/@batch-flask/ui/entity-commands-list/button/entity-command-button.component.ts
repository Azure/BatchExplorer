import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import { autobind } from "@batch-flask/core";
import { EntityCommand } from "@batch-flask/ui/entity-commands";

// import "./entity-command-button.scss";

@Component({
    selector: "bl-entity-command-button",
    templateUrl: "entity-command-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityCommandButtonComponent implements OnChanges {
    @Input() public command: EntityCommand<any>;
    @Input() public entity: any;

    public label: string;
    public icon: string;
    public disabled: boolean;
    public visible: boolean;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.changeDetector.markForCheck();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.command || changes.entity) {
            this.label = this.command.label(this.entity);
            this.disabled = this.command.disabled(this.entity);
            this.visible = this.command.visible(this.entity);
            this.icon = this.command.icon(this.entity);
        }
    }

    @autobind()
    public execute() {
        return this.command.execute(this.entity);
    }
}
