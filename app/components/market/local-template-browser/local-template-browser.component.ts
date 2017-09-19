import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { NcjTemplateType } from "app/models";
import { NcjTemplateService } from "app/services";
import "./local-template-browser.scss";

@Component({
    selector: "bl-local-template-browser",
    templateUrl: "local-template-browser.html",
})
export class LocalTemplateBrowserComponent {
    public NcjTemplateType = NcjTemplateType;

    public pickedTemplateFile: File = null;
    public valid = false;
    public error: string;
    public templateType: NcjTemplateType = null;

    constructor(private router: Router, private templateService: NcjTemplateService) { }
    public pickTemplateFile(template: any) {
        this.pickedTemplateFile = template.target.files[0];
        this._loadTemplateFile();
    }

    public runThisTemplate() {
        if (!this.pickedTemplateFile) { return; }

        this.router.navigate(["/market/local/submit"], {
            queryParams: {
                templateFile: this.pickedTemplateFile.path,
            },
        });
    }

    private async _loadTemplateFile() {
        const path = this.pickedTemplateFile.path;
        try {
            const { type } = await this.templateService.loadLocalTemplateFile(path);
            this.templateType = type;

            if (type === NcjTemplateType.unknown) {
                this.valid = false;
            } else {
                this.valid = true;
            }
        } catch (error) {
            this.error = error;
            this.valid = false;
            return;
        }
    }
}
