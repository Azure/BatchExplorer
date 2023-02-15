import {
    BooleanParameter,
    FormValues,
    NumberParameter,
    Parameter,
    ParameterName,
    StringListParameter,
    StringParameter,
} from "@batch/ui-common/lib/form";
import * as React from "react";
import { ResourceGroupParameter } from "../../form/resource-group-parameter";
import {
    LocationParameter,
    StorageAccountParameter,
    SubscriptionParameter,
} from "../../form";
import { BooleanParamCheckbox } from "./bool-param-checkbox";
import {
    FormControlOptions,
    FormControlResolver,
} from "./form-control-resolver";
import { ResourceGroupDropdown } from "./resource-group-dropdown";
import { StorageAccountDropdown } from "./storage-account-dropdown";
import { StringParamTextField } from "./string-param-textfield";
import { SubscriptionDropdown } from "./subscription-dropdown";
import { LocationDropdown } from "./location-dropdown";

export class DefaultFormControlResolver implements FormControlResolver {
    getFormControl<V extends FormValues, K extends ParameterName<V>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions<V, K>
    ): JSX.Element {
        const { id, onChange } = opts ?? {};

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

        throw new Error(`Unknown parameter type: ${param.constructor.name}`);
    }
}
