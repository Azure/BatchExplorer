import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { SidebarRef } from "@batch-flask/ui";
import { UrlUtils } from "@batch-flask/utils";
import { LocalBatchAccount } from "app/models";
import { LocalBatchAccountService } from "app/services";

import "./add-local-batch-account.scss";

@Component({
    selector: "bl-edit-local-batch-account",
    templateUrl: "add-local-batch-account.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLocalBatchAccountComponent {
    public title = "Edit local batch account";
    public form: FormGroup;
    private _existingAccount: LocalBatchAccount;

    constructor(
        public sidebarRef: SidebarRef<any>,
        private localAccountService: LocalBatchAccountService,
        formBuilder: FormBuilder) {

        this.form = formBuilder.group({
            displayName: [""],
            name: ["", Validators.required],
            url: ["", {validators: [Validators.required, Validators.pattern(UrlUtils.URL_REGEX)], updateOn: "blur"}],
            key: ["", Validators.required],
        });
    }

    public set existingAccount(account: LocalBatchAccount) {
        this.form.patchValue({
            displayName: account.displayName,
            name: account.name,
            url: account.url,
            key: account.key,
        });
        this._existingAccount = account;
    }

    @autobind()
    public submit() {
        return this.localAccountService.update(new LocalBatchAccount({
            ...this.form.value,
            id: this._existingAccount.id,
        }));
    }
}
