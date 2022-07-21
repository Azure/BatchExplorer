import {
    DependencyName,
    Parameter,
    ParameterType as CommonParameterType,
} from "@batch/ui-common";
import { inject } from "@batch/ui-common/lib/environment";
import { FormValues } from "@batch/ui-common/lib/form";
import {
    LocationService,
    ResourceGroupService,
    StorageAccount,
    StorageAccountService,
    SubscriptionService,
} from "@batch/ui-service";
import * as React from "react";
import { useState } from "react";
import { useAsyncEffect, useUniqueId } from "../../hooks";
import { Button } from "../button";
import { Callout } from "./callout";
import { ComboBox } from "./combobox";
import { Dropdown } from "./dropdown";
import { Stack } from "./stack";
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
                    <LocationComboBox id={id} key={param.name} param={param} />
                );
            case ParameterType.ResourceGroupId:
                return (
                    <ResourceGroupComboBox
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

export function ResourceGroupComboBox<
    V extends FormValues,
    K extends Extract<keyof V, string>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param } = props;
    const value = param.value == null ? undefined : String(param.value);
    const id = useUniqueId("form-control", props.id);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [options, setOptions] = React.useState<
        { key: string; text: string }[]
    >([]);
    const form = param.parentForm;
    const [subscriptionId, setSubscriptionId] = useState<string>(
        form.values.subscriptionId as string
    );
    const [selectedKey, setSelectedKey] = React.useState<string>("");

    const service: ResourceGroupService = inject(
        DependencyName.ResourceGroupService
    );

    useAsyncEffect(async () => {
        try {
            if (subscriptionId) {
                const resourceGroups = await service.list(subscriptionId);
                setOptions(
                    resourceGroups.map((sub) => {
                        return { key: sub.id, text: sub.name };
                    })
                );
            } else {
                setOptions([]);
            }
            setLoading(false);
        } catch (error) {
            console.warn("ERROR", error);
            setOptions([]);
            setLoading(false);
        }
    }, [subscriptionId]);

    React.useEffect(() => {
        const handler = form.onChange((values: FormValues) => {
            if ("subscriptionId" in values) {
                setSubscriptionId(values.subscriptionId as string);
            }
        });
        return () => form.removeOnChange(handler);
    });

    const onChange = React.useCallback(
        (event, option?, index?: number, value?: string): void => {
            const key = option?.key;
            if (!option && value) {
                // If the user types in their own resource group, we must add it to the list of resource group options since it does not exist in there yet
                setOptions((prevOptions) => [
                    ...prevOptions,
                    { key: key, text: value },
                ]);
            }

            setSelectedKey(key);
            param.value = key as V[K];
        },
        [param]
    );

    //Callout logic

    const ref = React.useRef<any>(null);

    const [isCalloutVisible, toggleIsCalloutVisible] = useState(false);

    React.useEffect(() => {
        const checkIfClickedOutside = (e: any) => {
            // If the callout is open and the clicked target is outside of the callout, then close the callout
            if (
                isCalloutVisible &&
                ref.current &&
                ref.current.contains(e.target)
            ) {
                toggleIsCalloutVisible(false);
            }
        };

        document.addEventListener("mousedown", checkIfClickedOutside);

        return () => {
            // Cleanup the event listener
            document.removeEventListener("mousedown", checkIfClickedOutside);
        };
    }, [isCalloutVisible]);

    const [createNewNameValue, setCreateNewNameValue] = React.useState<
        string | undefined
    >("");

    const [errorMsg, setErrorMsg] = React.useState<string | undefined>("");

    const styles = {
        buttons: {
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 20,
        },
    };

    return (
        <>
            <ComboBox
                id={id}
                disabled={loading || param.disabled}
                options={options}
                allowFreeform={false}
                selectedKey={selectedKey}
                placeholder={param.placeholder}
                value={value}
                onChange={onChange}
            />

            <Button
                label="Create new"
                id={"callout-button"}
                onClick={() => toggleIsCalloutVisible((oldState) => !oldState)}
            />
            <div
                className="wrapper"
                ref={ref}
                style={{
                    display: "inline-flex",
                    flexDirection: "column",
                }}
            >
                <Callout
                    style={{
                        display: "inline-block",
                    }}
                    gapSpace={0}
                    isCalloutVisible={isCalloutVisible}
                    body="A resource group is a container that holds related resources for an Azure solution."
                    bodyFontSize="medium"
                    target={`#${"callout-button"}`}
                    setInitialFocus={true}
                    onDismiss={() =>
                        toggleIsCalloutVisible((oldState) => !oldState)
                    }
                >
                    <br></br>
                    <TextField
                        textFieldLabel="Name"
                        value={createNewNameValue}
                        required={true}
                        errorMessage={errorMsg}
                        onChange={(newValue: string | undefined) => {
                            setCreateNewNameValue(newValue);
                        }}
                    />
                    <Stack childrenGap={8} horizontal style={styles.buttons}>
                        <Button
                            label="OK"
                            primary={true}
                            onClick={() => {
                                if (createNewNameValue) {
                                    if (
                                        //string has whitespaces or last character is a period (invalid)
                                        /\s/.test(createNewNameValue) ||
                                        createNewNameValue[
                                            createNewNameValue.length - 1
                                        ] == "."
                                    ) {
                                        setErrorMsg(
                                            "Resource group names can only include alphanumeric, underscore, parentheses, hyphen, period (except at end), and Unicode characters that match the allowed characters."
                                        );
                                    } else {
                                        //new resource group name entered is valid
                                        setErrorMsg("");
                                        param.value =
                                            createNewNameValue as V[K];

                                        let counter = 0;

                                        const nameWithNewKeyword =
                                            "(New) " + createNewNameValue;

                                        for (
                                            let i = 0;
                                            i < options.length;
                                            i++
                                        ) {
                                            if (
                                                createNewNameValue.toUpperCase() ===
                                                    options[
                                                        i
                                                    ].text.toUpperCase() ||
                                                nameWithNewKeyword.toUpperCase() ===
                                                    options[
                                                        i
                                                    ].text.toUpperCase()
                                            ) {
                                                if (
                                                    //a newly created RG value by the user
                                                    options[i].text.includes(
                                                        "(New)"
                                                    )
                                                ) {
                                                    options[i].text =
                                                        "(New) " +
                                                        createNewNameValue;

                                                    setSelectedKey(
                                                        options[i].key
                                                    );

                                                    toggleIsCalloutVisible(
                                                        (oldState) => !oldState
                                                    );
                                                } else {
                                                    //an existing RG value upon loading the subscription
                                                    setErrorMsg(
                                                        "A resource group with the same name already exists in the selected subscription."
                                                    );
                                                }

                                                counter++;
                                            }
                                        }

                                        // If item is not in the RG options list, then add it
                                        if (counter === 0) {
                                            setOptions((prevOptions) => [
                                                ...prevOptions,
                                                {
                                                    key: createNewNameValue,
                                                    text: nameWithNewKeyword,
                                                },
                                            ]);

                                            setSelectedKey(createNewNameValue);
                                            toggleIsCalloutVisible(
                                                (oldState) => !oldState
                                            );
                                        }
                                    }
                                }
                            }}
                        />
                        <Button
                            label="Cancel"
                            onClick={() => {
                                toggleIsCalloutVisible((oldState) => !oldState);
                            }}
                        />
                    </Stack>
                </Callout>
            </div>
        </>
    );
}

export function LocationComboBox<
    V extends FormValues,
    K extends Extract<keyof V, string>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param } = props;
    const value = param.value == null ? undefined : String(param.value);
    const id = useUniqueId("form-control", props.id);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [options, setOptions] = React.useState<
        { key: string; text: string }[]
    >([]);
    const form = param.parentForm;
    const [subscriptionId, setSubscriptionId] = useState<string>(
        form.values.subscriptionId as string
    );
    const [selectedKey, setSelectedKey] = React.useState<string>("");

    const service: LocationService = inject(DependencyName.LocationService);

    useAsyncEffect(async () => {
        try {
            if (subscriptionId) {
                const locations = await service.list(subscriptionId);
                setOptions(
                    locations.map((sub) => {
                        return { key: sub.name, text: sub.displayName };
                    })
                );
            } else {
                setOptions([]);
            }
            setLoading(false);
        } catch (error) {
            console.warn("ERROR", error);
            setOptions([]);
            setLoading(false);
        }
    }, [subscriptionId]);

    React.useEffect(() => {
        const handler = form.onChange((values: FormValues) => {
            if ("subscriptionId" in values) {
                setSubscriptionId(values.subscriptionId as string);
            }
        });
        return () => form.removeOnChange(handler);
    });

    const onChange = React.useCallback(
        (event, option?, index?: number, value?: string): void => {
            const key = option?.key;
            setSelectedKey(key);
            param.value = key as V[K];
        },
        [param]
    );

    return (
        <ComboBox
            id={id}
            disabled={loading || param.disabled}
            options={options}
            allowFreeform={true}
            selectedKey={selectedKey}
            placeholder={param.placeholder}
            value={value}
            onChange={onChange}
        />
    );
}
