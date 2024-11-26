// import { translate } from "@azure/bonito-core/lib/localization";
import { translate } from "@azure/bonito-core";
import { AbstractAction } from "@azure/bonito-core/lib/action";
import {
    Form,
    StringListParameter,
    StringListValidationDetails,
    StringParameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import { createReactForm } from "@azure/bonito-ui";
import { RadioButton, StringList } from "@azure/bonito-ui/lib/components/form";
import React from "react";

export enum AccessRuleType {
    AllNetworks = "all-networks",
    SelectedNetworks = "selected-networks",
    Disabled = "disabled",
}

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
        subForm.param("checkedValue", StringParameter, {
            label: "Access Rule",
            value: AccessRuleType.Disabled,
            render(props) {
                return (
                    <RadioButton
                        {...props}
                        options={[
                            // TODO i18n key
                            {
                                key: AccessRuleType.AllNetworks,
                                text: translate(
                                    "lib.react.networking.accessRules.allNetworks"
                                ),
                            },
                            {
                                key: AccessRuleType.SelectedNetworks,
                                text: translate(
                                    "lib.react.networking.accessRules.selectedNetworks"
                                ),
                            },
                            {
                                key: AccessRuleType.Disabled,
                                text: translate(
                                    "lib.react.networking.accessRules.disabled"
                                ),
                            },
                        ]}
                    />
                );
            },
        });
        subForm.param("ips", StringListParameter, {
            label: "Address ranges",
            value: [],
            hidden: false,
            dynamic: {
                hidden: (form) => {
                    return (
                        form.checkedValue !== AccessRuleType.SelectedNetworks
                    );
                },
            },
            render(props) {
                return <StringList {...props} />;
            },
            placeholder: "Enter IP address",
            onValidateSync(value) {
                const errorData: StringListValidationDetails = {};
                value?.forEach((ip, index) => {
                    if (!ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                        errorData[index] = "Invalid IP address";
                    }
                });
                if (Object.keys(errorData).length > 0) {
                    return new ValidationStatus("error", "", errorData);
                }
                return new ValidationStatus("ok");
            },
        });
        return subForm;
    }
}

function a(x: <X>(x: X) => void): any {
    return x;
}

a(() => {
    const x = 1;
    return x;
});
