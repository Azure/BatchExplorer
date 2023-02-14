import { inject } from "@batch/ui-common/lib/environment";
import {
    FormValues,
    ParameterName,
    ValidationStatus,
} from "@batch/ui-common/lib/form";
import { StorageAccount, StorageAccountService } from "@batch/ui-service";
import * as React from "react";
import { useEffect, useState } from "react";
import { BrowserDependencyName } from "../..";
import { useAsyncEffect, useUniqueId } from "../../hooks";
import { Dropdown } from "./dropdown";
import { ParamControlProps } from "./form-control";

export function StorageAccountDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param } = props;
    const value = param.value == null ? undefined : String(param.value);

    const [loading, setLoading] = useState<boolean>(true);
    const [storageAccounts, setStorageAccounts] = useState<StorageAccount[]>(
        []
    );
    const id = useUniqueId("form-control", props.id);
    const service: StorageAccountService = inject(
        BrowserDependencyName.StorageAccountService
    );
    const form = param.parentForm;
    const [subscriptionId, setSubscriptionId] = useState<string>(
        form.values.subscriptionId as string
    );
    const [validationStatus, setValidationStatus] =
        useState<ValidationStatus | null>();

    useAsyncEffect(async () => {
        let accounts: StorageAccount[] = [];
        try {
            if (subscriptionId) {
                accounts = await service.list(subscriptionId);
            }
            setValidationStatus(null);
        } catch (error) {
            setValidationStatus(new ValidationStatus("error", error + ""));
        } finally {
            setStorageAccounts(accounts);
            setLoading(false);
        }
    }, [subscriptionId]);

    useEffect(() => {
        const handler = form.on("change", (values: FormValues) =>
            setSubscriptionId(values.subscriptionId as string)
        );
        return () => form.off("change", handler);
    }, [form]);

    const options = storageAccounts.map((sub) => {
        return { value: sub.id, label: sub.name };
    });

    return (
        <Dropdown
            id={id}
            label={param.label}
            disabled={loading || param.disabled}
            options={options}
            placeholder={param.placeholder}
            value={value}
            validationStatus={validationStatus ?? param.validationStatus}
            onChange={(value: string) => (param.value = value as V[K])}
        />
    );
}
