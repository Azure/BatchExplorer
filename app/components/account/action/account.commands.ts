import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { AccountResource } from "app/models";
import { AccountService } from "app/services";

@Injectable()
export class AccountResourceCommands extends EntityCommands<AccountResource> {
    public delete: EntityCommand<AccountResource, void>;

    constructor(
        injector: Injector,
        private accountService: AccountService) {
        super(
            injector,
            "BatchAccount",
        );

        this._buildCommands();
    }

    public get(jobId: string) {
        return this.accountService.get(jobId);
    }

    public getFromCache(jobId: string) {
        return this.accountService.getFromCache(jobId);
    }

    private _buildCommands() {
        this.delete = this.simpleCommand({
            label: "Delete",
            action: (account: AccountResource) => this.accountService.deleteBatchAccount(account.id),
        });

        this.commands = [
            this.delete,
        ];
    }
}
