import { FormValues, ParameterName } from "@batch/ui-common/lib/form";
import * as React from "react";
import { useUniqueId } from "../../hooks";
import { ParamControlProps } from "./form-control";
import { TextField } from "./text-field";

export function StringParamTextField<
    V extends FormValues,
    K extends ParameterName<V>
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
