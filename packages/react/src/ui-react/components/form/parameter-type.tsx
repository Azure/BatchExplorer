import {
    DependencyName,
    Parameter,
    ParameterType as CommonParameterType,
} from "@batch/ui-common";
import { inject } from "@batch/ui-common/lib/environment";
import { FormValues } from "@batch/ui-common/lib/form";
import {
    StorageAccount,
    StorageAccountService,
    SubscriptionService,
} from "@batch/ui-service";
import * as React from "react";
import { useState } from "react";
import { useAsyncEffect, useUniqueId } from "../../hooks";
import { Dropdown } from "./dropdown";
import { TextField } from "./text-field";

enum ExtendedParameterType {
    BatchAccountName = "BatchAccountName",
    LocationId = "LocationId",
    ResourceGroupId = "ResourceGroupId",
    StorageAccountId = "StorageAccountId",
    SubscriptionId = "SubscriptionId",
    Tags = "Tags",
}

export const ParameterType = {
    ...CommonParameterType,
    ...ExtendedParameterType,
};

export interface FormControlOptions {
    id?: string;
}

export interface ParameterTypeResolver {
    getFormControl<V extends FormValues, K extends Extract<keyof V, string>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions
    ): JSX.Element;
}

export class DefaultParameterTypeResolver implements ParameterTypeResolver {
    getFormControl<V extends FormValues, K extends Extract<keyof V, string>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions
    ): JSX.Element {
        const id = opts?.id;
        switch (param.type) {
            // Common types
            case ParameterType.String:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.StringList:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.Number:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.Boolean:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );

            // Extended types
            case ParameterType.BatchAccountName:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.LocationId:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.ResourceGroupId:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.StorageAccountId:
                return (
                    <StorageAccountDropdown
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.SubscriptionId:
                return (
                    <SubscriptionIdParamDropdown
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            case ParameterType.Tags:
                return (
                    <StringParamTextField
                        id={id}
                        key={param.name}
                        param={param}
                    />
                );
            default:
                throw new Error(`Unknown parameter type: ${param.type}`);
        }
    }
}

export interface ParamControlProps<
    V extends FormValues,
    K extends Extract<keyof V, string>
> {
    id?: string;
    param: Parameter<V, K>;
}

export function StringParamTextField<
    V extends FormValues,
    K extends Extract<keyof V, string>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param } = props;
    const value = param.value == null ? "" : String(param.value);
    const id = useUniqueId("form-control", props.id);
    return (
        <TextField
            id={id}
            label={param.label}
            value={value}
            onChange={(newValue: string | undefined) => {
                param.value = newValue as V[K];
            }}
        />
    );
}

export function StorageAccountDropdown<
    V extends FormValues,
    K extends Extract<keyof V, string>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param } = props;
    const value = param.value == null ? undefined : String(param.value);

    const [loading, setLoading] = useState<boolean>(true);
    const [storageAccounts, setStorageAccounts] = React.useState<
        StorageAccount[]
    >([]);
    const id = useUniqueId("form-control", props.id);
    const service: StorageAccountService = inject(
        DependencyName.StorageAccountService
    );
    const form = param.parentForm;
    const [subscriptionId, setSubscriptionId] = useState<string>(
        form.values.subscriptionId as string
    );

    useAsyncEffect(async () => {
        try {
            if (subscriptionId) {
                const accounts = await service.list(subscriptionId);
                setStorageAccounts(accounts);
            } else {
                setStorageAccounts([]);
            }
        } catch (error) {
            console.warn("ERROR", error);
            setStorageAccounts([]);
        }
        setLoading(false);
    }, [subscriptionId]);

    React.useEffect(() => {
        const handler = form.onChange((values: FormValues) => {
            if ("subscriptionId" in values) {
                console.log("Setting sub ID", values.subscriptionId);
                setSubscriptionId(values.subscriptionId as string);
            }
        });
        return () => form.removeOnChange(handler);
    });

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
            onChange={(value: string) => (param.value = value as V[K])}
        />
    );
}

export function SubscriptionIdParamDropdown<
    V extends FormValues,
    K extends Extract<keyof V, string>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param } = props;
    const value = param.value == null ? undefined : String(param.value);
    const id = useUniqueId("form-control", props.id);

    const [loading, setLoading] = React.useState<boolean>(true);
    const [subscriptions, setSubscriptions] = React.useState<
        { id: string; displayName: string }[]
    >([]);

    const service: SubscriptionService = inject(
        DependencyName.SubscriptionService
    );

    useAsyncEffect(async () => {
        try {
            setSubscriptions(await service.list());
            setLoading(false);
        } catch (error) {
            console.warn("ERROR", error);
            setSubscriptions([]);
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
            onChange={(newValue: string) => (param.value = newValue as V[K])}
        />
    );
}
