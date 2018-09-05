import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { SidebarRef } from "@batch-flask/ui";
import { LocalBatchAccount } from "app/models";
import { LocalBatchAccountService } from "app/services";

import "./add-local-batch-account.scss";

@Component({
    selector: "bl-add-local-batch-account",
    templateUrl: "add-local-batch-account.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLocalBatchAccountComponent {
    public title = "Add local batch account";
    public form: FormGroup;

    constructor(
        public sidebarRef: SidebarRef<any>,
        // private changeDetector: ChangeDetectorRef,
        private localAccountService: LocalBatchAccountService,
        formBuilder: FormBuilder) {

        this.form = formBuilder.group({
            displayName: [""],
            name: ["", Validators.required],
            url: ["", Validators.required],
            key: ["", Validators.required],
        });
    }

    @autobind()
    public submit() {
        return this.localAccountService.create(new LocalBatchAccount(this.form.value));
    }
}
