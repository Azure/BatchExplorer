// import { translate } from "@azure/bonito-core/lib/localization";
import { AbstractAction } from "@azure/bonito-core/lib/action";
import { Form, ValidationStatus } from "@azure/bonito-core/lib/form";
import { createReactForm } from "@azure/bonito-ui";
import {
    AccessRuleRadioButtonsParamter,
    AccessRuleType,
} from "./access-rule-radio-parameter";

type IAccessRuleFormValue = {
    checkedValue: AccessRuleType;
    ips?: string[];
};

export type UpdateAccessRulesFormValue = {
    account?: IAccessRuleFormValue;
    nodeMgmt?: IAccessRuleFormValue;
};

declare let formValue: Record<string, unknown>;
declare let var1: UpdateAccessRulesFormValue;

// var1 = formValue;
// console.log(formValue);

export class UpdateAccessRulesAction extends AbstractAction<UpdateAccessRulesFormValue> {
    actionName = "UpdateNodeCommunicationMode";

    // private _poolService: PoolService = inject(
    //     BrowserDependencyName.PoolService
    // );

    // private _batchAccountId: string;

    async onInitialize(): Promise<UpdateAccessRulesFormValue> {
        return {
            account: {
                checkedValue: AccessRuleType.AllNetworks,
            },
            nodeMgmt: {
                checkedValue: AccessRuleType.AllNetworks,
            },
        };
    }

    constructor(batchAccountId: string) {
        super();
        // this._batchAccountId = batchAccountId;
    }

    buildForm(
        initialValues: UpdateAccessRulesFormValue
    ): Form<UpdateAccessRulesFormValue> {
        const form = createReactForm<UpdateAccessRulesFormValue>({
            values: initialValues,
        });

        const accountSubForm = this._buildSubForm(initialValues.account);

        const nodeMgmtSubForm = this._buildSubForm(initialValues.nodeMgmt);

        form.subForm("account", accountSubForm, {
            title: "Account Access Rules",
        });
        form.subForm("nodeMgmt", nodeMgmtSubForm, {
            title: "Node Management Access Rules",
        });

        // const accountSubForm = form.subForm(
        //     "account",
        //     createReactForm<IAccessRuleFormValue>({
        //         values: initialValues.account || {
        //             checkedValue: AccessRuleType.AllNetworks,
        //         },
        //     })
        // );

        // accountSubForm.param("checkedValue", AccessRuleRadioButtonsParamter, {
        //     title: "Access Rule",
        //     label: translate(
        //         "lib.react.pool.parameter.currentNodeCommunicationMode.label"
        //     ),
        // });

        // const nodeMgmtSubForm = form.subForm(
        //     "nodeMgmt",
        //     createReactForm<IAccessRuleFormValue>({
        //         values: initialValues.account || {
        //             checkedValue: AccessRuleType.AllNetworks,
        //         },
        //     })
        // );

        // nodeMgmtSubForm.param("checkedValue", AccessRuleRadioButtonsParamter, {
        //     title: "Access Rule",
        //     label: translate(
        //         "lib.react.pool.parameter.currentNodeCommunicationMode.label"
        //     ),
        // });

        return form;
    }

    onValidateSync(): ValidationStatus {
        return new ValidationStatus("ok");
    }

    async onExecute(values: UpdateAccessRulesFormValue): Promise<void> {
        this.logger.info("values", values);
    }

    private _buildSubForm(initialValues?: IAccessRuleFormValue) {
        const subForm = createReactForm<IAccessRuleFormValue>({
            values: initialValues || {
                checkedValue: AccessRuleType.AllNetworks,
            },
        });
        subForm.param("checkedValue", AccessRuleRadioButtonsParamter, {
            // title: "Access Rule",
            label: "Access Rule",
        });
        return subForm;
    }
}
