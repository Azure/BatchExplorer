import {
    BooleanParameter,
    FormValues,
    NumberParameter,
    ParameterDependencies,
    ParameterName,
    StringListParameter,
    StringParameter,
} from "@batch/ui-common/lib/form";
import * as React from "react";
import {
    LocationParameter,
    StorageAccountParameter,
    SubscriptionParameter,
} from "../../form";
import { ResourceGroupParameter } from "../../form/resource-group-parameter";
import { BooleanParamCheckbox } from "./bool-param-checkbox";
import { ParamControlProps } from "./form-control";
import { FormControlResolver } from "./form-control-resolver";
import { LocationDropdown } from "./location-dropdown";
import { ResourceGroupDropdown } from "./resource-group-dropdown";
import { StorageAccountDropdown } from "./storage-account-dropdown";
import { StringParamTextField } from "./string-param-textfield";
import { SubscriptionDropdown } from "./subscription-dropdown";

export class DefaultFormControlResolver implements FormControlResolver {
    getFormControl<
        V extends FormValues,
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>
    >(props: ParamControlProps<V, K, D>): JSX.Element {
        const { param, id, onChange } = props;

        if (param instanceof StringParameter) {
            return (
                <StringParamTextField
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof StringListParameter) {
            return (
                <StringParamTextField
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof NumberParameter) {
            return (
                <StringParamTextField
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof BooleanParameter) {
            return (
                <BooleanParamCheckbox
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
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
