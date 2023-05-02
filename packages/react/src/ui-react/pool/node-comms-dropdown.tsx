import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@batch/ui-common/lib/form";
import * as React from "react";
import { useUniqueId } from "../hooks";
import { useFormParameter } from "../hooks/use-form-parameter";
import { Dropdown, DropdownOption } from "../components/form/dropdown";
import { FormControlProps } from "../components/form/form-control";
import {
    NODE_COMMS_MODE_CLASSIC,
    NODE_COMMS_MODE_DEFAULT,
    NODE_COMMS_MODE_SIMPLIFIED,
    NodeCommsParameter,
} from "./node-comms-parameter";

export function NodeCommsDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: FormControlProps<
        V,
        K,
        ParameterDependencies<V>,
        NodeCommsParameter<V, K>
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

    useFormParameter(param);

    return (
        <Dropdown
            id={id}
            ariaLabel={ariaLabel ?? param.label}
            className={className}
            style={style}
            disabled={disabled}
            options={
                [
                    {
                        value: NODE_COMMS_MODE_DEFAULT,
                    },
                    {
                        value: NODE_COMMS_MODE_SIMPLIFIED,
                    },
                    {
                        value: NODE_COMMS_MODE_CLASSIC,
                    },
                ] as DropdownOption<V, K>[]
            }
            param={param}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
        />
    );
}
