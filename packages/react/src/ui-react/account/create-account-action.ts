import { createForm, Form } from "@batch/ui-common";
import { AbstractAction } from "@batch/ui-common/lib/action";
import {
    StringListParameter,
    StringParameter,
    ValidationStatus,
} from "@batch/ui-common/lib/form";
import { delayedCallback } from "@batch/ui-common/lib/util";
import { translate } from "@batch/ui-common/lib/localization";
import { StorageAccountParameter, SubscriptionParameter } from "../form";

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
    buildForm(
        initialValues: CreateAccountFormValues
    ): Form<CreateAccountFormValues> {
        const form = createForm<CreateAccountFormValues>({
            title: "Create Account",
            values: initialValues,
        });
        form.param("subscriptionId", SubscriptionParameter, {
            label: translate("subscription"),
        });
        form.param("resourceGroupId", StringParameter, {
            label: translate("resourceGroup"),
        });
        form.param("accountName", StringParameter, {
            label: translate("accountName"),
            required: true,
            description:
                "This is how you identify your Batch account. It must be unique.",
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
        form.param("location", StringParameter, {
            label: "Location",
        });
        form.param("storageAccountId", StorageAccountParameter, {
            label: "Storage account",
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
        alert("Would write form values: " + formValues);
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
