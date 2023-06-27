import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";
import { LocalTemplateService } from "app/services";
import { take } from "rxjs/operators";

import "./local-template-source-form.scss";

@Component({
    selector: "bl-local-template-source-form",
    templateUrl: "local-template-source-form.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalTemplateSourceFormComponent implements OnInit {
    // public sources: LocalTemplateFolder[];
    public sources = new FormControl([]);

    constructor(public dialogRef: MatDialogRef<any>, private localTemplateService: LocalTemplateService) {
    }

    public ngOnInit() {
        this.localTemplateService.sources.pipe(take(1)).subscribe((sources) => {
            this.sources.setValue(sources);
        });
    }

    @autobind()
    public save() {
        this.localTemplateService.setSources(this.sources.value);
    }
}
