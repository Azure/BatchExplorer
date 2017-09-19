import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { FileSystemService } from "app/services";
import "./local-template-browser.scss";

enum TemplateType {
    pool = 1,
    job = 2,
    unknown = 3,
}
@Component({
    selector: "bl-local-template-browser",
    templateUrl: "local-template-browser.html",
})
export class LocalTemplateBrowserComponent {
    public TemplateType = TemplateType;

    public pickedTemplateFile: File = null;
    public valid = false;
    public error: string;
    public templateType: TemplateType = null;

    constructor(private fs: FileSystemService, private router: Router) { }
    public pickTemplateFile(template: any) {
        this.pickedTemplateFile = template.target.files[0];
        this._loadTemplateFile();
    }

    public useThisTemplate() {
        if (!this.pickedTemplateFile) { return; }

        this.router.navigate(["/market/local/submit"], {
            queryParams: {
                templateFile: this.pickedTemplateFile.path,
            },
        });
    }

    private async _loadTemplateFile() {
        const path = this.pickedTemplateFile.path;
        const content = await this.fs.readFile(path);
        let json;
        try {
            json = JSON.parse(content);
        } catch (error) {
            this.error = `File is not valid json: ${error.message}`;
            this.valid = false;
            return;
        }

        if (json.job) {
            this.valid = true;
            this.templateType = TemplateType.job;
        } else if (json.pool) {
            this.valid = true;
            this.templateType = TemplateType.pool;
        } else {
            this.valid = false;
            this.templateType = TemplateType.unknown;
        }
    }
}
