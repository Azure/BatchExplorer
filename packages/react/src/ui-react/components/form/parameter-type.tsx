import { ParameterType as CommonParameterType } from "@batch/ui-common";
import * as React from "react";
import { Parameter } from "@batch/ui-common";
import { TextField } from "./text-field";
import { Dropdown } from "./dropdown";
import { useAsyncEffect } from "../../hooks";
import { FormValues } from "@batch/ui-common/lib/form";

enum ExtendedParameterType {
    SubscriptionId = "SubscriptionId",
    ResourceGroupId = "ResourceGroupId",
    LocationId = "LocationId",
    BatchAccountName = "BatchAccountName",
}

export const ParameterType = {
    ...CommonParameterType,
    ...ExtendedParameterType,
};

export interface ParameterTypeResolver {
    getFormControl<V extends FormValues>(param: Parameter<V>): JSX.Element;
}

export class DefaultParameterTypeResolver implements ParameterTypeResolver {
    getFormControl<V extends FormValues>(param: Parameter<V>): JSX.Element {
        switch (param.type) {
            case ParameterType.String:
                return <StringParamTextField key={param.name} param={param} />;
            case ParameterType.SubscriptionId:
                return (
                    <SubscriptionIdParamDropdown
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.ResourceGroupId:
                return <StringParamTextField key={param.name} param={param} />;
            case ParameterType.LocationId:
                return <StringParamTextField key={param.name} param={param} />;
            case ParameterType.BatchAccountName:
                return <StringParamTextField key={param.name} param={param} />;
            default:
                throw new Error(`Unknown parameter type: ${param.type}`);
        }
    }
}

export interface ParamControlProps<V extends FormValues> {
    param: Parameter<V>;
}

export function StringParamTextField<V extends FormValues>(
    props: ParamControlProps<V>
): JSX.Element {
    const { param } = props;
    const value = param.value == null ? "" : String(param.value);
    return (
        <TextField
            label={param.label}
            value={value}
            onChange={(newValue: string | undefined) => {
                param.value = newValue as V[Extract<keyof V, string>];
            }}
        />
    );
}

export function SubscriptionIdParamDropdown<V extends FormValues>(
    props: ParamControlProps<V>
): JSX.Element {
    const { param } = props;
    const value = param.value == null ? undefined : String(param.value);

    const [loading, setLoading] = React.useState<boolean>(true);
    const [subscriptions, setSubscriptions] = React.useState<
        { id: string; displayName: string }[]
    >([]);

    useAsyncEffect(async () => {
        // TODO: Make this a real HTTP request
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setSubscriptions([
                    { id: "/fake/sub1", displayName: "Subscription One" },
                    { id: "/fake/sub2", displayName: "Subscription Two" },
                    { id: "/fake/sub3", displayName: "Subscription Three" },
                ]);
                setLoading(false);
                resolve();
            }, 1000);
        });
    });

    const options = subscriptions.map((sub) => {
        return { value: sub.id, label: sub.displayName };
    });

    return (
        <Dropdown
            label={param.label}
            disabled={loading || param.disabled}
            options={options}
            placeholder={param.placeholder}
            value={value}
            onChange={(newValue: string) => {
                param.value = newValue as V[Extract<keyof V, string>];
            }}
        />
    );
}
