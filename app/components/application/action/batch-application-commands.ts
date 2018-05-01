import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { BatchApplication } from "app/models";
import { ApplicationService, PinnedEntityService } from "app/services";
import { ApplicationEditDialogComponent } from "./edit";

@Injectable()
export class BatchApplicationCommands extends EntityCommands<BatchApplication> {
    public edit: EntityCommand<BatchApplication, void>;
    public delete: EntityCommand<BatchApplication, void>;
    public pin: EntityCommand<BatchApplication, void>;

    constructor(
        injector: Injector,
        private applicationService: ApplicationService,
        private pinnedEntityService: PinnedEntityService,
        private sidebarManager: SidebarManager) {
        super(
            injector,
            "BatchApplication",
        );

        this._buildCommands();
    }

    public get(applicationId: string) {
        return this.applicationService.get(applicationId);
    }

    public getFromCache(applicationId: string) {
        return this.applicationService.getFromCache(applicationId);
    }

    private _buildCommands() {
        this.edit = this.simpleCommand({
            label: "Edit",
            action: (application) => this._editApplication(application),
            multiple: false,
            confirm: false,
            notify: false,
        });
        this.delete = this.simpleCommand({
            label: "Delete",
            action: (application: BatchApplication) => this.applicationService.delete(application.id),
        });
        this.pin = this.simpleCommand({
            label: (application: BatchApplication) => {
                return this.pinnedEntityService.isFavorite(application) ? "Unpin favorite" : "Pin to favorites";
            },
            action: (application: BatchApplication) => this._pinApplication(application),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.edit,
            this.delete,
            this.pin,
        ];
    }

    private _editApplication(application: BatchApplication) {
        const sidebarRef = this.sidebarManager.open("edit-application", ApplicationEditDialogComponent);
        sidebarRef.component.setValue(application);
    }

    private _pinApplication(application: BatchApplication) {
        this.pinnedEntityService.pinFavorite(application).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(application);
            }
        });
    }
}
