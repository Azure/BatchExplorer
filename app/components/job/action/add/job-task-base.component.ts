import { Input } from "@angular/core";
import {
    FormBuilder,
    FormGroup,
    Validators,
} from "@angular/forms";
import { RangeValidatorDirective } from "app/components/base/validation";
import { UserAccount } from "app/models";
import { Constants } from "app/utils";
import { List } from "immutable";

export class JobTaskBaseComponent {
    @Input()
    public userAccounts: List<UserAccount> | UserAccount[];

    public form: FormGroup;
    public constraintsGroup: FormGroup;
    protected _propagateChange: (value: any) => void = null;
    protected _baseFormControls: any;
    constructor(formBuilder: FormBuilder) {
        const validation = Constants.forms.validation;
        this.constraintsGroup = formBuilder.group({
            maxTaskRetryCount: [
                0,
                new RangeValidatorDirective(validation.range.retry.min, validation.range.retry.max).validator,
            ],
        });

        this._baseFormControls = {
            id: ["", Validators.required],
            commandLine: ["", Validators.required],
            constraints: this.constraintsGroup,
            userIdentity: [null],
            resourceFiles: [[]],
            environmentSettings: [[]],
        };
    }
}
