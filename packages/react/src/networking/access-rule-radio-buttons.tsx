import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { useUniqueId } from "@azure/bonito-ui";
import {
    FormControlProps,
    RadioButton,
} from "@azure/bonito-ui/lib/components/form";
import * as React from "react";
// import { useFormParameter } from "../hooks/use-form-parameter";

import {
    AccessRuleType,
    AccessRuleRadioButtonsParamter,
} from "./access-rule-radio-parameter";

export function AccessRuleRadioButtons<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: FormControlProps<
        V,
        K,
        ParameterDependencies<V>,
        AccessRuleRadioButtonsParamter<V, K>
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

    const id = useUniqueId("node-comms-dropdown", props.id);

    return (
        <RadioButton
            id={id}
            ariaLabel={ariaLabel ?? param.label}
            className={className}
            style={style}
            disabled={disabled}
            options={[
                // TODO i18n key
                {
                    key: AccessRuleType.AllNetworks,
                    text: "AllNetworks",
                },
                {
                    key: AccessRuleType.SelectedNetworks,
                    text: "SelectedNetworks",
                },
                {
                    key: AccessRuleType.Disabled,
                    text: "Disabled",
                },
            ]}
            param={param}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
        />
    );
}
