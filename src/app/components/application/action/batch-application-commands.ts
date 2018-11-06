import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { BatchApplication } from "app/models";
import { ApplicationService, PinnedEntityService } from "app/services";
import { ApplicationCreateDialogComponent } from "./create";
import { ApplicationEditDialogComponent } from "./edit";

@Injectable()
export class BatchApplicationCommands extends EntityCommands<BatchApplication> {
    public add: EntityCommand<BatchApplication, void>;
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
        this.add = this.simpleCommand({
            name: "add",
            ...COMMAND_LABEL_ICON.AddApplication,
            action: (application) => this._addPackage(application),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.edit = this.simpleCommand({
            name: "edit",
            ...COMMAND_LABEL_ICON.Edit,
            action: (application) => this._editApplication(application),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.delete = this.simpleCommand({
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (application: BatchApplication) => this.applicationService.delete(application.id),
            permission: Permission.Write,
        });

        this.pin = this.simpleCommand({
            name: "pin",
            label: (application: BatchApplication) => {
                return this.pinnedEntityService.isFavorite(application)
                ? COMMAND_LABEL_ICON.UnpinFavoriteLabel : COMMAND_LABEL_ICON.PinFavoriteLabel;
            },
            icon: (application: BatchApplication) => {
                return this.pinnedEntityService.isFavorite(application)
                ? COMMAND_LABEL_ICON.UnpinFavoriteIcon : COMMAND_LABEL_ICON.PinFavoriteIcon;
            },
            action: (application: BatchApplication) => this._pinApplication(application),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.add,
            this.edit,
            this.delete,
            this.pin,
        ];
    }

    private _addPackage(application: BatchApplication) {
        const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(application);
        sidebarRef.afterCompletion.subscribe(() => {
            this.get(application.id);
        });
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
