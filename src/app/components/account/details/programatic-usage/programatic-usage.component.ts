import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { VTabGroupComponent } from "@batch-flask/ui";
import { BatchAccount } from "app/models";
import { BatchAccountService, StorageAccountService } from "app/services";
import { SharedKeyCredentials } from "./shared-key-credentials.model";

import { StorageAccountKeysService } from "app/services/storage";
import "./programatic-usage.scss";

export enum CredentialType {
    SharedKey = "shared-key",
    AAD = "aad",
}

export interface AADCredential {
    tenantId: string;
    clientId: string;
    secret: string;
}

@Component({
    selector: "bl-programatic-usage",
    templateUrl: "programatic-usage.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramaticUsageComponent {
    @ViewChild("tabs") public tabs: VTabGroupComponent;
    public CredentialType = CredentialType;
    public account: BatchAccount;
    public sharedKeyCredentials: SharedKeyCredentials;
    public aadCredentials: AADCredential;

    public pickedCredentialType = CredentialType.SharedKey;

    public set accountId(accountId: string) {
        const changed = accountId !== this._accountId;
        this._accountId = accountId;
        if (accountId && changed) {
            this._loadDetails();
        }
        this.changeDetector.detectChanges();
    }
    public get accountId() { return this._accountId; }

    private _accountId: string;

    constructor(
        private storageAccountService: StorageAccountService,
        private storageAccountKeysService: StorageAccountKeysService,
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef) {
    }

    public pickCredentialType(type: CredentialType) {
        this.pickedCredentialType = type;
        this.changeDetector.markForCheck();
    }

    public pickType(type: string) {
        this.tabs.selectTab(type);
    }

    public updateAADCredentials(cred: AADCredential) {
        this.aadCredentials = cred;
        this.changeDetector.markForCheck();
    }
    private _loadDetails() {
        this.accountService.get(this.accountId).subscribe((account) => {
            this.account = account;
            this.changeDetector.markForCheck();

            this.accountService.getAccountKeys(this.accountId).subscribe((keys) => {
                this.sharedKeyCredentials = {
                    ...this.sharedKeyCredentials,
                    batchAccount: {
                        resource: this.account,
                        primary: keys.primary,
                        secondary: keys.secondary,
                    },
                };
                this.changeDetector.markForCheck();
            });

            if (account.autoStorage) {
                this.storageAccountService.get(account.autoStorage.storageAccountId).subscribe((storageAccount) => {
                    this.storageAccountKeysService.getFor(account.autoStorage.storageAccountId).subscribe((keys) => {
                        this.sharedKeyCredentials = {
                            ...this.sharedKeyCredentials,
                            storageAccount: {
                                resource: storageAccount,
                                primary: keys.primaryKey,
                                secondary: keys.secondaryKey,
                            },
                        };
                        this.changeDetector.markForCheck();
                    });
                });

            }
        });
    }
}
