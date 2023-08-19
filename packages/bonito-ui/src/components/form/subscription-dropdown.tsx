import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import * as React from "react";
import { SubscriptionParameter } from "../../form";
import { useUniqueId } from "../../hooks";
import { useFormParameter } from "../../hooks/use-form-parameter";
import { Dropdown, DropdownOption } from "./dropdown";
import { FormControlProps } from "./form-control";

/**
 * Dropdown for selecting subscriptions. Uses the short subscription ID
 * (00000000-0000-0000-0000-000000000000), not the full ARM ID
 * (/subscriptions/00000000-0000-0000-0000-000000000000) as values.
 */
export function SubscriptionDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: FormControlProps<
        V,
        K,
        ParameterDependencies<V>,
        SubscriptionParameter<V, K>
    >
): JSX.Element {
    const {
        ariaLabel,
        className,
        disabled,
        onFocus,
        onBlur,
        onChange,
        param,
        style,
    } = props;

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
            }) as DropdownOption<V, K>[];
    }, [param]);

    const { data, loading } = useFormParameter(param, {
        loadData: loadData,
    });

    return (
        <Dropdown
            id={id}
            ariaLabel={ariaLabel ?? param.label}
            className={className}
            style={style}
            disabled={disabled || loading}
            options={data ?? []}
            param={param}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
        />
    );
}
