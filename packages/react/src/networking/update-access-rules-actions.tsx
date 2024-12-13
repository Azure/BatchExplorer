// import { translate } from "@azure/bonito-core/lib/localization";
import { translate, IPv4Subnet, safeGetIpv4Subnet } from "@azure/bonito-core";
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

// function validateAccessRulesInputs(values: string[]): {
//     valid: boolean;
//     error: StringListValidationDetails;
// } {
//     // check if duplicate
//     let valid = true;
//     const errorData: StringListValidationDetails = {};
//     const uniqueValues = new Set<string>();
//     values.forEach((value, index) => {
//         if (uniqueValues.has(value)) {
//             valid = false;
//             errorData[index] = "Duplicate IP address";
//         }
//         uniqueValues.add(value);
//     });

//     if (!valid) {
//         return {
//             valid: false,
//             error: errorData,
//         };
//     }
// }

// function validateSingleInput(value: string): void {
//     const valueSplit = value.split("/");
//     if (
//         valueSplit.length === 1 &&
//         !getIPv4andIPv6AddressValidator(value, ko.observable(false), false)
//     ) {
//         // An IP address is expected
//         return Q({
//             valid: false,
//             message:
//                 ClientResources.AccessControl.ClientIpExceptions
//                     .invalidIp4Address,
//         });
//     } else if (valueSplit.length > 1 && valueSplit[1]?.length === 0) {
//         // An IP address with a terminating '/' is expected.
//         return Q({
//             valid: false,
//             message:
//                 ClientResources.AccessControl.ClientIpExceptions.invalidCidr,
//         });
//     } else if (valueSplit.length > 1) {
//         // A CIDR is expected
//         return Q(
//             performCidrValidation(
//                 {
//                     prefixRequired: false,
//                     cidrBlockValidationRequired: true,
//                     minCidr: Constants.ExternalIpRange.minCidr,
//                     maxCidr: Constants.ExternalIpRange.maxCidr,
//                 },
//                 value
//             )
//         );
//     }
// }

// function validatePublicIpRange(value: string): void {
//     // ACLs IP rules must be public IPs. See https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml
//     // Verified that the following ranges are also blocked by the server.
//     const nonPublicdSubnets = [
//         new IPv4Subnet("0.0.0.0/8"), // Local identification
//         new IPv4Subnet("10.0.0.0/8"), // Private IPs
//         new IPv4Subnet("172.16.0.0/12"), // Private IPs
//         new IPv4Subnet("192.168.0.0/16"), // Private IPs
//         new IPv4Subnet("224.0.0.0/3"), // 224.0.0.0 - 255.255.255.255 (Multicast & "Future use")
//     ];

//     const address = safeGetIpv4Subnet(value);

//     if (address) {
//         nonPublicdSubnets.forEach((blacklistedSubnet) => {
//             if (blacklistedSubnet.doesSubnetOverlap(address)) {
//                 throw new Error(
//                     translate("lib.react.networking.validation.invalidPublicIp")
//                 );
//             }
//         });
//     }
// }
