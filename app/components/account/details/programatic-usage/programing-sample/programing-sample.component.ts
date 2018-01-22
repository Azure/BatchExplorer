import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { prerequisites, sampleTemplates } from "./samples";

import { AADCredential, CredentialType } from "app/components/account/details/programatic-usage";
import { EditorConfig } from "app/components/base/editor";
import { AccountKeys, AccountResource } from "app/models";
import "./programing-sample.scss";

export enum SampleLanguage {
    python = "python",
    csharp = "csharp",
    nodejs = "nodejs",
}

const engineLanguages = {
    nodejs: "javascript",
};

@Component({
    selector: "bl-programing-sample",
    templateUrl: "programing-sample.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramingSampleComponent implements OnChanges {
    @Input() public language: SampleLanguage;
    @Input() public account: AccountResource;
    @Input() public sharedKeys: AccountKeys;
    @Input() public aadCredentials: AADCredential;
    @Input() public credentialType: CredentialType;

    public prerequisites: string[];
    public content: string;
    public editorConfig: EditorConfig;

    public ngOnChanges(changes) {
        this._updateContent();
        this._updatePrerequisites();
        this._updateConfig();
    }

    public trackPrerequisite(index, item) {
        return item;
    }

    private get accountName() {
        return this.account && this.account.name || "";
    }

    private get accountUrl() {
        const url = this.account && this.account.properties.accountEndpoint;
        return url ? `https://${url}` : "";
    }

    private get key() {
        return this.sharedKeys && this.sharedKeys.primary || "";
    }

    private _updateContent() {
        const template: string = this._getTemplate();
        if (!template) {
            return this.content = "";
        }
        if (this.credentialType === CredentialType.AAD) {
            const cred = this.aadCredentials || {} as any;
            this.content = template.format(this.accountUrl,
                cred.tenantId,
                cred.clientId,
                cred.secret);
        } else {
            this.content = template.format(this.accountName, this.accountUrl, this.key);
        }
    }

    private _getTemplate() {
        if (this.credentialType === CredentialType.AAD) {
            return sampleTemplates.aad[this.language];
        } else {
            return sampleTemplates.sharedKey[this.language];
        }
    }

    private _updatePrerequisites() {
        if (this.credentialType === CredentialType.AAD) {
            this.prerequisites = prerequisites.aad[this.language];
        } else {
            this.prerequisites = prerequisites.sharedKey[this.language];
        }
    }

    private _updateConfig() {
        let language = this.language;
        if (language in engineLanguages) {
            language = engineLanguages[language];
        }
        this.editorConfig = {
            language,
            readOnly: true,
        };
    }
}
