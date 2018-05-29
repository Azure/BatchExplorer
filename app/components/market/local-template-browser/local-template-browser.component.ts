import { Component, HostListener } from "@angular/core";
import { Router } from "@angular/router";

import { NcjTemplateType } from "app/models";
import { NcjTemplateService } from "app/services";
import { DragUtils } from "app/utils";

import "./local-template-browser.scss";

@Component({
    selector: "bl-local-template-browser",
    templateUrl: "local-template-browser.html",
})
export class LocalTemplateBrowserComponent {
    public static breadcrumb() {
        return { name: "Local templates" };
    }

    public isDraging = 0;
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

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        const allowDrop = this._canDrop(event.dataTransfer);
        DragUtils.allowDrop(event, allowDrop);
    }

    @HostListener("dragenter", ["$event"])
    public dragEnter(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        event.stopPropagation();
        this.isDraging++;
    }

    @HostListener("dragleave", ["$event"])
    public dragLeave(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        this.isDraging--;
    }

    @HostListener("drop", ["$event"])
    public handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this._resetDragDrop();

        const filesAndFolders = [...event.dataTransfer.files as any];
        if (filesAndFolders.length > 1) {
            this.error = "Unable to drop more than one JSON template. Please select one template.";
            this.valid = false;
        } else {
            this.pickedTemplateFile = filesAndFolders[0];
            this._loadTemplateFile();
        }

        this.isDraging = 0;
    }

    private _canDrop(dataTransfer: DataTransfer) {
        return dataTransfer.types.includes("Files");
    }

    private _resetDragDrop() {
        this.valid = true;
        this.pickedTemplateFile = null;
        this.templateType = null;
        this.error = "";
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
