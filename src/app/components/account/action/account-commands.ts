import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, DialogService, EntityCommand, EntityCommands, Permission, SidebarManager } from "@batch-flask/ui";
import { ProgramaticUsageComponent } from "app/components/account/details/programatic-usage";
import { BatchAccount, BatchAccountProvisingState, LocalBatchAccount } from "app/models";
import { BatchAccountService } from "app/services";
import { EditLocalBatchAccountComponent } from "./add";
import { DeleteAccountDialogComponent } from "./delete";

@Injectable()
export class BatchAccountCommands extends EntityCommands<BatchAccount> {
    public showKeys: EntityCommand<BatchAccount, void>;
    public delete: EntityCommand<BatchAccount, void>;
    public edit: EntityCommand<BatchAccount, void>;

    private _dialog: DialogService;
    private _sidebarManager: SidebarManager;

    constructor(
        injector: Injector,
        private accountService: BatchAccountService) {
        super(
            injector,
            "BatchAccount",
        );
        this._sidebarManager = injector.get(SidebarManager);
        this._dialog = injector.get(DialogService);
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
            name: "showKeys",
            ...COMMAND_LABEL_ICON.Credentials,
            action: (account) => this._showKeys(account),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.delete = this.simpleCommand({
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (account: BatchAccount) => {
                this.accountService.delete(account.id);
            },
            enabled: (account: BatchAccount) => {
                const accountState = account && account.provisioningState;
                return accountState !== BatchAccountProvisingState.Creating
                    && accountState !== BatchAccountProvisingState.Deleting;
            },
            confirm: (accounts) => this._confirmDeletion(accounts),
            permission: Permission.Write,
        });

        this.edit = this.simpleCommand({
            name: "edit",
            label: "Edit",
            icon: "fa fa-pencil",
            confirm: false,
            multiple: false,
            action: (account: LocalBatchAccount) => {
                this._editLocalBatchAccount(account);
            },
            visible: (account: BatchAccount) => account instanceof LocalBatchAccount,
            notify: false,
        });

        this.commands = [
            this.showKeys,
            this.delete,
            this.edit,
        ];
    }

    private _showKeys(account: BatchAccount) {
        const ref = this.dialogService.open(ProgramaticUsageComponent);
        ref.componentInstance.accountId = account.id;
    }

    private _editLocalBatchAccount(account: LocalBatchAccount) {
        const ref = this._sidebarManager.open(`edit-account-${account.id}`, EditLocalBatchAccountComponent);
        ref.component.existingAccount = account;
    }

    private _confirmDeletion(entities: BatchAccount[]) {
        const dialogRef = this._dialog.open(DeleteAccountDialogComponent);
        dialogRef.componentInstance.accounts = entities;
        return dialogRef.componentInstance.onSubmit;
    }
}
