import { FormValues, ParameterName } from "@batch/ui-common/lib/form";
import * as React from "react";
import { useUniqueId } from "../../hooks";
import { ParamControlProps } from "./form-control";
import { TextField } from "./text-field";

export function StringParamTextField<
    V extends FormValues,
    K extends ParameterName<V>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param, onChange } = props;
    const value = param.value == null ? "" : String(param.value);
    const id = useUniqueId("form-control", props.id);
    return (
        <TextField
            id={id}
            dirty={param.dirty}
            label={param.label}
            disabled={param.disabled}
            placeholder={param.placeholder}
            value={value}
            validationStatus={param.validationStatus}
            onChange={(event, value) => {
                param.value = value as V[K];
                param.dirty = true;
                if (onChange) {
                    onChange(event, param.value);
                }
            }}
        />
    );
}
