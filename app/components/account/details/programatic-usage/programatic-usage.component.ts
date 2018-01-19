import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { AccountKeys, AccountResource } from "app/models";
import { AccountService } from "app/services";

import "./programatic-usage.scss";

export enum CredentialType {
    SharedKey,
    AAD,
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
    public CredentialType = CredentialType;
    public account: AccountResource;
    public sharedKeys: AccountKeys;
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
        private accountService: AccountService,
        private changeDetector: ChangeDetectorRef) {
    }

    public pickCredentialType(type: CredentialType) {
        this.pickedCredentialType = type;
        this.changeDetector.markForCheck();
    }

    public updateAADCredentials(cred: AADCredential) {
        this.aadCredentials = cred;
        this.changeDetector.markForCheck();
    }
    private _loadDetails() {
        this.accountService.get(this.accountId).subscribe((account) => {
            this.account = account;
            this.changeDetector.markForCheck();
        });

        this.accountService.getAccountKeys(this.accountId).subscribe((keys) => {
            this.sharedKeys = keys;
            this.changeDetector.markForCheck();
        });
    }
}
