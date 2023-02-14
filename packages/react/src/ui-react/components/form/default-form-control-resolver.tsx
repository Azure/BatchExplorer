import {
    FormValues,
    NumberParameter,
    Parameter,
    ParameterName,
    StringListParameter,
    StringParameter,
} from "@batch/ui-common/lib/form";
import * as React from "react";
import { StorageAccountParameter, SubscriptionParameter } from "../../form";
import {
    FormControlOptions,
    FormControlResolver,
} from "./form-control-resolver";
import { StorageAccountDropdown } from "./storage-account-dropdown";
import { StringParamTextField } from "./string-param-textfield";
import { SubscriptionDropdown } from "./subscription-dropdown";

export class DefaultFormControlResolver implements FormControlResolver {
    getFormControl<V extends FormValues, K extends ParameterName<V>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions
    ): JSX.Element {
        const id = opts?.id;

        if (param instanceof StringParameter) {
            return (
                <StringParamTextField id={id} key={param.name} param={param} />
            );
        } else if (param instanceof StringListParameter) {
            return (
                <StringParamTextField id={id} key={param.name} param={param} />
            );
        } else if (param instanceof NumberParameter) {
            return (
                <StringParamTextField id={id} key={param.name} param={param} />
            );
        } else if (param instanceof SubscriptionParameter) {
            return (
                <SubscriptionDropdown id={id} key={param.name} param={param} />
            );
        } else if (param instanceof StorageAccountParameter) {
            return (
                <StorageAccountDropdown
                    id={id}
                    key={param.name}
                    param={param}
                />
            );
        }

        throw new Error(`Unknown parameter type: ${param.constructor.name}`);
    }
}
