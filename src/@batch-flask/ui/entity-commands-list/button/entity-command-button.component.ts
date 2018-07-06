import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
} from "@angular/core";
import { autobind } from "@batch-flask/core";
import { WorkspaceService } from "@batch-flask/ui";
import { EntityCommand } from "@batch-flask/ui/entity-commands";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-entity-command-button",
    templateUrl: "entity-command-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityCommandButtonComponent implements OnChanges, OnDestroy {
    @Input() public command: EntityCommand<any>;
    @Input() public entity: any;

    public label: string;
    public icon: string;
    public disabled: boolean;
    public visible: boolean;
    public feature: string;
    private _sub: Subscription;

    constructor(
        changeDetector: ChangeDetectorRef,
        workspaceService: WorkspaceService) {

        this._sub = workspaceService.currentWorkspace.subscribe(() => {
            this._updateVisibility();
            changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.command || changes.entity) {
            this.label = this.command.label(this.entity);
            this.disabled = this.command.disabled(this.entity);
            this.icon = this.command.icon(this.entity);
            this._updateVisibility();
        }
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @autobind()
    public execute() {
        return this.command.execute(this.entity);
    }

    private _updateVisibility() {
        this.visible = this.command.visible(this.entity);
    }
}
