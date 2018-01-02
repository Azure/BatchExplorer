import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { prerequisites, sampleTemplates } from "./samples";

import { EditorConfig } from "app/components/base/editor";
import { AccountKeys, AccountResource } from "app/models";
import "./programing-sample.scss";
export enum SampleLanguage {
    python = "python",
    csharp = "csharp",
}

@Component({
    selector: "bl-programing-sample",
    templateUrl: "programing-sample.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramingSampleComponent implements OnChanges {
    @Input() public language: SampleLanguage;
    @Input() public account: AccountResource;
    @Input() public keys: AccountKeys;

    public prerequisites: string[];
    public content: string;
    public editorConfig: EditorConfig;

    public ngOnChanges(changes) {
        if (changes.language || changes.account || changes.keys) {
            this._updateContent();
            this._updatePrerequisites();
            this._updateConfig();
        }
    }

    private get accountName() {
        return this.account && this.account.name || "";
    }

    private get accountUrl() {
        const url = this.account && this.account.properties.accountEndpoint;
        return url ? `https://${url}` : "";
    }

    private get key() {
        return this.keys && this.keys.primary || "";
    }

    private _updateContent() {
        const template: string = sampleTemplates[this.language];
        if (template) {
            this.content = template.format(this.accountName, this.accountUrl, this.key);
        } else {
            this.content = "";
        }
    }

    private _updatePrerequisites() {
        this.prerequisites = prerequisites[this.language];
    }

    private _updateConfig() {
        this.editorConfig = {
            language: this.language,
        };
    }
}
