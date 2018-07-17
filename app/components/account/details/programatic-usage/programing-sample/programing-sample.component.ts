import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { prerequisites, sampleTemplates } from "./samples";

import { EditorConfig } from "@batch-flask/ui/editor";
import { AADCredential, CredentialType } from "app/components/account/details/programatic-usage";
import { AccountResource } from "app/models";
import { BatchExplorerService } from "app/services";
import { SharedKeyCredentials } from "../shared-key-credentials.model";
import "./programing-sample.scss";

export enum SampleTarget {
    python = "python",
    csharp = "csharp",
    nodejs = "nodejs",
    aztk = "aztk",
    doAzureParallel = "doAzureParallel",
}

const engineLanguages = {
    nodejs: "javascript",
    aztk: "yaml",
    doAzureParallel: "json",
};

@Component({
    selector: "bl-programing-sample",
    templateUrl: "programing-sample.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramingSampleComponent implements OnChanges {
    public CredentialType = CredentialType;
    @Input() public target: SampleTarget;
    @Input() public account: AccountResource;
    @Input() public sharedKeyCredentials: SharedKeyCredentials;
    @Input() public aadCredentials: AADCredential;
    @Input() public credentialType: CredentialType;

    public prerequisites: string[];
    public content: string;
    public editorConfig: EditorConfig;

    constructor(private batchExplorer: BatchExplorerService) {}

    public ngOnChanges(changes) {
        this._updateContent();
        this._updatePrerequisites();
        this._updateConfig();
    }

    public trackPrerequisite(index, item) {
        return item;
    }

    private get accountUrl() {
        const url = this.account && this.account.properties.accountEndpoint;
        return url ? `https://${url}` : "";
    }

    private _updateContent() {
        const template: string = this._getTemplate();
        if (!template) {
            return this.content = "";
        }
        if (this.credentialType === CredentialType.AAD) {
            const cred = this.aadCredentials || {} as any;
            this.content = template.format({
                accountUrl: this.accountUrl,
                tenantId: cred.tenantId,
                clientId: cred.clientId,
                secret: cred.secret,
                batchAccountId: this.account && this.account.id,
                storageAccountId: this.account && this.account.autoStorage && this.account.autoStorage.storageAccountId,
            });
        } else {
            this.content = template.format(this._getSharedKeyParams());
        }
    }

    private _getSharedKeyParams() {
        if (!this.sharedKeyCredentials) { return {}; }
        const { batchAccount, storageAccount } = this.sharedKeyCredentials;
        const params: any = {};
        if (batchAccount) {
            params.batchAccountUrl = this.accountUrl;
            params.batchAccountName = batchAccount.resource.name;
            params.batchAccountKey = batchAccount.primary;
        }
        if (storageAccount) {
            params.storageAccountName = storageAccount.resource.name;
            params.storageAccountKey = storageAccount.primary;
            params.storageAccountSuffix = this.batchExplorer.azureEnvironment.storageEndpoint;
        }
        return params;
    }

    private _getTemplate() {
        if (this.credentialType === CredentialType.AAD) {
            return sampleTemplates.aad[this.target];
        } else {
            return sampleTemplates.sharedKey[this.target];
        }
    }

    private _updatePrerequisites() {
        if (this.credentialType === CredentialType.AAD) {
            this.prerequisites = prerequisites.aad[this.target];
        } else {
            this.prerequisites = prerequisites.sharedKey[this.target];
        }
    }

    private _updateConfig() {
        let language = this.target;
        if (language in engineLanguages) {
            language = engineLanguages[language];
        }
        this.editorConfig = {
            language,
            readOnly: true,
        };
    }
}
