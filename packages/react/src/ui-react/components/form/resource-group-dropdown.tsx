import { FormValues, ParameterName } from "@batch/ui-common/lib/form";
import * as React from "react";
import {
    ResourceGroupDependencies,
    ResourceGroupParameter,
} from "../../form/resource-group-parameter";
import { useUniqueId } from "../../hooks";
import { useFormParameter } from "../../hooks/use-form-parameter";
import { Dropdown } from "./dropdown";
import { ParamControlProps } from "./form-control";

export function ResourceGroupDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: ParamControlProps<
        V,
        K,
        ResourceGroupDependencies<V>,
        ResourceGroupParameter<V, K, ResourceGroupDependencies<V>>
    >
): JSX.Element {
    const { param, onChange } = props;

    const id = useUniqueId("form-control", props.id);

    const loadData = React.useCallback(async () => {
        const resourceGroups = await param.loadResourceGroups();
        return resourceGroups
            .map((rg) => {
                return { value: rg.id, label: rg.name };
            })
            .sort((a, b) => {
                return a.label > b.label ? 1 : -1;
            });
    }, [param]);

    const { data, loading, validationStatus } = useFormParameter(param, {
        loadData: loadData,
    });

    return (
        <Dropdown
            id={id}
            label={param.label}
            disabled={loading || param.disabled}
            options={data ?? []}
            placeholder={param.placeholder}
            value={param.value == null ? undefined : String(param.value)}
            validationStatus={validationStatus}
            onChange={(event, value) => {
                param.value = value as V[K];
                if (onChange) {
                    onChange(event, param.value);
                }
            }}
        />
    );
}
