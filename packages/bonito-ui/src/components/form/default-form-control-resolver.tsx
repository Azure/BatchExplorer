import {
    BooleanParameter,
    FormValues,
    NumberParameter,
    ParameterDependencies,
    ParameterName,
    PasswordParameter,
    StringListParameter,
    StringParameter,
} from "@azure/bonito-core/lib/form";
import * as React from "react";
import {
    LocationParameter,
    StorageAccountParameter,
    SubscriptionParameter,
} from "../../form";
import { ResourceGroupParameter } from "../../form/resource-group-parameter";
import { Checkbox } from "./checkbox";
import { FormControlProps } from "./form-control";
import { FormControlResolver } from "./form-control-resolver";
import { LocationDropdown } from "./location-dropdown";
import { ResourceGroupDropdown } from "./resource-group-dropdown";
import { StorageAccountDropdown } from "./storage-account-dropdown";
import { StringList } from "./string-list";
import { SubscriptionDropdown } from "./subscription-dropdown";
import { TextField } from "./text-field";

export class DefaultFormControlResolver implements FormControlResolver {
    getFormControl<
        V extends FormValues,
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>
    >(props: FormControlProps<V, K, D>): JSX.Element {
        const { param, id, onChange } = props;

        if (param instanceof StringParameter) {
            return (
                <TextField
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof StringListParameter) {
            return (
                <StringList
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof NumberParameter) {
            return (
                <TextField
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof BooleanParameter) {
            return (
                <Checkbox
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof PasswordParameter) {
            return (
                <TextField
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                    type="password"
                />
            );
        } else if (param instanceof SubscriptionParameter) {
            return (
                <SubscriptionDropdown
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof ResourceGroupParameter) {
            return (
                <ResourceGroupDropdown
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof LocationParameter) {
            return (
                <LocationDropdown
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof StorageAccountParameter) {
            return (
                <StorageAccountDropdown
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        }

        throw new Error(
            `Failed to get form control for parameter: ${param.constructor.name}`
        );
    }
}
