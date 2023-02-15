import { getLogger } from "@batch/ui-common";
import { FormValues, ParameterName } from "@batch/ui-common/lib/form";
import * as React from "react";
import { useUniqueId } from "../../hooks";
import { Checkbox } from "./checkbox";
import { ParamControlProps } from "./form-control";

export function BooleanParamCheckbox<
    V extends FormValues,
    K extends ParameterName<V>
>(props: ParamControlProps<V, K>): JSX.Element {
    const { param, onChange } = props;

    let value: boolean | undefined;
    if (param.value == null) {
        value = undefined;
    } else if (param.value === true) {
        value = true;
    } else if (param.value === false) {
        value = false;
    } else {
        getLogger().warn("Invalid boolean value for parameter " + param.name);
        value = undefined;
    }

    const id = useUniqueId("form-control", props.id);
    return (
        <Checkbox
            id={id}
            dirty={param.dirty}
            label={param.label}
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
