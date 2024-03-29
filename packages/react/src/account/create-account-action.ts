import { createForm, getNotifier } from "@azure/bonito-core";
import { AbstractAction } from "@azure/bonito-core/lib/action";
import {
    Form,
    StringListParameter,
    StringParameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import { translate } from "@azure/bonito-core/lib/localization";
import { delayedCallback } from "@azure/bonito-core/lib/util";
import {
    LocationParameter,
    ResourceGroupParameter,
    StorageAccountParameter,
    SubscriptionParameter,
} from "@azure/bonito-ui/lib/form";

export type CreateAccountFormValues = {
    accountName?: string;
    subscriptionId?: string;
    resourceGroupId?: string;
    location?: string;
    storageAccountId?: string;
    identityType?: string;
    publicNetworkAccess?: string;
    poolAllocationMode?: string;
    allowedAuthenticationModes?: string[];
    tags?: Record<string, string>;
};

export class CreateAccountAction extends AbstractAction<CreateAccountFormValues> {
    actionName = "CreateAccount";

    private _initialValues: CreateAccountFormValues = {};

    async onInitialize(): Promise<CreateAccountFormValues> {
        return this._initialValues;
    }

    constructor(initialValues: CreateAccountFormValues) {
        super();
        if (initialValues) {
            this._initialValues = initialValues;
        }
    }

    buildForm(
        initialValues: CreateAccountFormValues
    ): Form<CreateAccountFormValues> {
        const form = createForm<CreateAccountFormValues>({
            title: "Create Account",
            values: initialValues,
        });
        form.param("subscriptionId", SubscriptionParameter, {
            label: translate("bonito.core.arm.subscription"),
            required: true,
        });
        form.param("resourceGroupId", ResourceGroupParameter, {
            dependencies: {
                subscriptionId: "subscriptionId",
            },
            label: translate("bonito.core.arm.resourceGroup"),
            required: true,
        });
        form.param("accountName", StringParameter, {
            label: translate("lib.react.account.parameter.name.label"),
            required: true,
            description:
                "This is how you identify your Batch account. It must be unique.",
            dynamic: {
                placeholder: (values) => {
                    // TODO: Probably better to use a custom control here like
                    //       we do in the existing account creation form.
                    //       Also needs to handle other clouds (and i18n)
                    const locationId = values.location;
                    if (locationId) {
                        const locationName = locationId.slice(
                            locationId.lastIndexOf("/") + 1
                        );
                        return `{account}.${locationName}.batch.azure.com`;
                    }
                    return "";
                },
            },
            onValidateAsync: async (value) => {
                if (value && !(await isAccountNameAvailable(value))) {
                    return new ValidationStatus(
                        "error",
                        `An account named ${value} already exists`
                    );
                }
                return new ValidationStatus("ok");
            },
        });
        form.param("location", LocationParameter, {
            dependencies: {
                subscriptionId: "subscriptionId",
            },
            label: translate("bonito.core.arm.location"),
            required: true,
        });
        form.param("storageAccountId", StorageAccountParameter, {
            dependencies: {
                subscriptionId: "subscriptionId",
            },
            label: translate("bonito.core.arm.storageAccount"),
            description:
                "Optional. For best performance we recommend a storage account (general purpose v2) located in the same region as the associated Batch account.",
        });

        const advancedSection = form.section("Advanced");
        advancedSection.param("identityType", StringParameter, {
            label: "Identity type",
        });
        advancedSection.param("publicNetworkAccess", StringParameter, {
            label: "Public network access",
        });
        advancedSection.param("poolAllocationMode", StringParameter, {
            label: "Pool allocation mode",
        });
        advancedSection.param(
            "allowedAuthenticationModes",
            StringListParameter,
            {
                label: "Authentication modes",
            }
        );

        const tagsSection = form.section("Tags");
        tagsSection.param("tags", StringParameter, {
            hideLabel: true,
        });

        return form;
    }

    onValidateSync(): ValidationStatus {
        return new ValidationStatus("ok");
    }

    async onValidateAsync(): Promise<ValidationStatus> {
        return new ValidationStatus("ok");
    }

    async onExecute(formValues: CreateAccountFormValues): Promise<void> {
        getNotifier().info(
            "Account created",
            "Would write form values:\n" +
                JSON.stringify(formValues, undefined, 4)
        );
    }
}

async function isAccountNameAvailable(accountName: string): Promise<boolean> {
    // TODO: Replace this with a real implementation and create a
    //       parameter type for account name
    const existingAccountNames = new Set<string>([
        "one",
        "two",
        "three",
        "test",
    ]);

    return delayedCallback(() => {
        let isAvailable = true;
        if (accountName && existingAccountNames.has(accountName)) {
            isAvailable = false;
        }
        return isAvailable;
    }, 200);
}
