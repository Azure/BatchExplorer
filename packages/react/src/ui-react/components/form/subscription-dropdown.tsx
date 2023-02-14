import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@batch/ui-common/lib/form";
import * as React from "react";
import { SubscriptionParameter } from "../..";
import { useUniqueId } from "../../hooks";
import { useFormParameter } from "../../hooks/use-form-parameter";
import { Dropdown } from "./dropdown";
import { ParamControlProps } from "./form-control";

/**
 * Dropdown for selecting subscriptions. Uses the short subscription ID
 * (00000000-0000-0000-0000-000000000000), not the full ARM ID
 * (/subscriptions/00000000-0000-0000-0000-000000000000) as values.
 */
export function SubscriptionDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: ParamControlProps<
        V,
        K,
        ParameterDependencies<V>,
        SubscriptionParameter<V, K>
    >
): JSX.Element {
    const { param, onChange } = props;
    const id = useUniqueId("form-control", props.id);

    const loadData = React.useCallback(async () => {
        const subscriptions = await param.loadSubscriptions();
        return subscriptions
            .map((sub) => {
                return {
                    value: sub.subscriptionId,
                    label: sub.displayName,
                };
            })
            .sort((a, b) => {
                return a.label > b.label ? 1 : -1;
            });
    }, [param]);

    const { data, loading, validationStatus } = useFormParameter(param, {
        loadData: loadData,
    });

    return (
        <Dropdown
            id={id}
            label={param.label}
            disabled={loading || param.disabled}
            options={data ?? []}
            placeholder={param.placeholder}
            value={param.value == null ? undefined : String(param.value)}
            validationStatus={validationStatus}
            onChange={(event, value) => {
                param.value = value as V[K];
                if (onChange) {
                    onChange(event, param.value);
                }
            }}
        />
    );
}
