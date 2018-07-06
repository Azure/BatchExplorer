import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from "@angular/core";
import { autobind } from "@batch-flask/core";
import { EntityCommand } from "@batch-flask/ui/entity-commands";
import { WorkspaceService } from "@batch-flask/ui/workspace";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-entity-command-button",
    templateUrl: "entity-command-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityCommandButtonComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public command: EntityCommand<any>;
    @Input() public entity: any;

    public label: string;
    public icon: string;
    public disabled: boolean;
    public visible: boolean;
    public feature: string;
    private _sub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private workspaceService: WorkspaceService) {
    }

    public ngOnInit() {
        this._sub = this.workspaceService.currentWorkspace.subscribe(() => {
            this._updateVisibility();
            this.changeDetector.markForCheck();
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
