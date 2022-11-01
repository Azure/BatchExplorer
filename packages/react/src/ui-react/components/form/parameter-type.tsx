import {
    Parameter,
    ParameterType as CommonParameterType,
} from "@batch/ui-common";
import { inject } from "@batch/ui-common/lib/environment";
import { FormValues, ValidationStatus } from "@batch/ui-common/lib/form";
import { StorageAccount, StorageAccountService } from "@batch/ui-service";
import * as React from "react";
import { useEffect, useState } from "react";
import { BrowserDependencyName } from "../..";
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
                    <SubscriptionDropdown
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
            dirty={param.dirty}
            label={param.label}
            value={value}
            validationStatus={param.validationStatus}
            onChange={(newValue: string | undefined) => {
                param.value = newValue as V[K];
                param.dirty = true;
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
        const handler = form.onChange((values: FormValues) =>
            setSubscriptionId(values.subscriptionId as string)
        );
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
            validationStatus={validationStatus ?? param.validationStatus}
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
