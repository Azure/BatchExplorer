import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";
import { BatchApplicationPackage } from "app/models";
import { BatchApplicationPackageListParams, BatchApplicationPackageService } from "app/services";
import { switchMap } from "rxjs/operators";

@Injectable()
export class BatchApplicationPackageCommands
    extends EntityCommands<BatchApplicationPackage, BatchApplicationPackageListParams> {

    public activate: EntityCommand<BatchApplicationPackage, void>;
    public delete: EntityCommand<BatchApplicationPackage, void>;

    constructor(
        injector: Injector,
        private packageService: BatchApplicationPackageService) {
        super(
            injector,
            "BatchApplicationPackage",
        );
        this._buildCommands();
    }

    public get(packageId: string) {
        return this.packageService.get(packageId);
    }

    public getFromCache(packageId: string) {
        return this.packageService.getFromCache(packageId);
    }

    private _buildCommands() {
        this.delete = this.simpleCommand({
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (pkg: BatchApplicationPackage) => this._delete(pkg),
            permission: Permission.Write,
        });
        this.activate = this.simpleCommand({
            name: "activate",
            label: "Activate",
            icon: "fa fa-toggle-on",
            action: (pkg: BatchApplicationPackage) => this._activate(pkg),
            permission: Permission.Write,
        });

        this.commands = [
            this.activate,
            this.delete,
        ];
    }

    private _delete(pkg: BatchApplicationPackage) {
        return this.packageService.delete(pkg.id);
    }

    private _activate(pkg: BatchApplicationPackage) {
        return this.packageService.activate(pkg.id).pipe(
            switchMap(() => this.packageService.get(pkg.id)),
        );
    }
}
