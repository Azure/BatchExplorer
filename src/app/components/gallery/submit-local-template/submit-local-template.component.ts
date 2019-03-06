import { ChangeDetectionStrategy,  Component, Input } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { NcjJobTemplate, NcjPoolTemplate, NcjTemplateType } from "app/models";
import { LocalTemplateService } from "app/services";

import "./submit-local-template.scss";

@Component({
    selector: "bl-submit-local-template",
    templateUrl: "submit-local-template.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmitLocalTemplateComponent {
    @Input() public set template(template: string) {
        this._template = template;
        this._updateTemplate();
    }
    public get template() { return this._template; }
    @Input() public filename: string;

    public error: string;
    public title: string;
    public loaded: boolean = false;

    public jobTemplate: NcjJobTemplate;
    public poolTemplate: NcjPoolTemplate;
    private _template: string;

    constructor(public dialogRef: MatDialogRef<any>, private localTemplateService: LocalTemplateService) {
    }

    private async _updateTemplate() {
        try {
            const { type, template } = this.localTemplateService.parseNcjTemplate(this.template);
            this.jobTemplate = null;
            this.poolTemplate = null;
            this.title = `Run template ${this.filename}`;
            if (type === NcjTemplateType.Job) {
                this.jobTemplate = template;
                this.loaded = true;
            } else if (type === NcjTemplateType.Pool) {
                this.poolTemplate = template;
                this.loaded = true;
            } else {
                this.error = "Cannot determine the type of this template.";
            }
        } catch (error) {
            this.error = error;
        }
    }
}
