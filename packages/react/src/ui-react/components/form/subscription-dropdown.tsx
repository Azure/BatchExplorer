import { inject } from "@batch/ui-common/lib/environment";
import {
    FormValues,
    ParameterName,
    ValidationStatus,
} from "@batch/ui-common/lib/form";
import { SubscriptionService } from "@batch/ui-service";
import * as React from "react";
import { useState } from "react";
import { BrowserDependencyName } from "../..";
import { useAsyncEffect, useUniqueId } from "../../hooks";
import { Dropdown } from "./dropdown";
import { ParamControlProps } from "./form-control";

export function SubscriptionDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param } = props;
    const value = param.value == null ? undefined : String(param.value);
    const id = useUniqueId("form-control", props.id);

    const [loading, setLoading] = useState<boolean>(true);
    const [subscriptions, setSubscriptions] = useState<
        { id: string; displayName: string }[]
    >([]);
    const [validationStatus, setValidationStatus] =
        useState<ValidationStatus | null>();

    const service: SubscriptionService = inject(
        BrowserDependencyName.SubscriptionService
    );

    useAsyncEffect(async () => {
        try {
            setSubscriptions(await service.list());
            setValidationStatus(null);
        } catch (error) {
            setSubscriptions([]);
            setValidationStatus(new ValidationStatus("error", error + ""));
        } finally {
            setLoading(false);
        }
    }, []);

    const options = subscriptions.map((sub) => {
        return { value: sub.id, label: sub.displayName };
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
            onChange={(newValue: string) => (param.value = newValue as V[K])}
        />
    );
}
