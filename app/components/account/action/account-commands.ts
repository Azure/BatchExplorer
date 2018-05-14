import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";

import { ProgramaticUsageComponent } from "app/components/account/details/programatic-usage";
import { AccountProvisingState, AccountResource } from "app/models";
import { AccountService } from "app/services";

@Injectable()
export class BatchAccountCommands extends EntityCommands<AccountResource> {
    public showKeys: EntityCommand<AccountResource, void>;
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

    public get(accountId: string) {
        return this.accountService.get(accountId);
    }

    public getFromCache(accountId: string) {
        return this.accountService.getFromCache(accountId);
    }

    private _buildCommands() {
        this.showKeys = this.simpleCommand({
            label: "Credentials and code samples",
            icon: "fa fa-key",
            action: (account) => this._showKeys(account),
            multiple: false,
            confirm: false,
            notify: false,
            tooltipPosition: "above",
        });

        this.delete = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Delete,
            action: (account: AccountResource) => this.accountService.deleteBatchAccount(account.id),
            enabled: (account: AccountResource) => {
                const accountState = account && account.properties && account.properties.provisioningState;
                const accountProvisioningState = AccountProvisingState;
                return accountState !== accountProvisioningState.Creating
                    && accountState !== accountProvisioningState.Deleting;
            },
            permission: Permission.Write,
        });

        this.commands = [
            this.showKeys,
            this.delete,
        ];
    }

    private _showKeys(account: AccountResource) {
        const ref = this.dialogService.open(ProgramaticUsageComponent);
        ref.componentInstance.accountId = account.id;
    }
}
