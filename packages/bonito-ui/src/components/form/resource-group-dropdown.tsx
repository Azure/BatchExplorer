import { FormValues, ParameterName } from "@azure/bonito-core/lib/form";
import * as React from "react";
import {
    ResourceGroupDependencies,
    ResourceGroupParameter,
} from "../../form/resource-group-parameter";
import { useUniqueId } from "../../hooks";
import { useFormParameter } from "../../hooks/use-form-parameter";
import { Dropdown, DropdownOption } from "./dropdown";
import { FormControlProps } from "./form-control";

export function ResourceGroupDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: FormControlProps<
        V,
        K,
        ResourceGroupDependencies<V>,
        ResourceGroupParameter<V, K, ResourceGroupDependencies<V>>
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

    const id = useUniqueId("form-control", props.id);

    const loadData = React.useCallback(async () => {
        const resourceGroups = await param.loadResourceGroups();
        return resourceGroups
            .map((rg) => {
                return { value: rg.id, label: rg.name };
            })
            .sort((a, b) => {
                return a.label > b.label ? 1 : -1;
            }) as DropdownOption<V, K>[];
    }, [param]);

    const { data, loading } = useFormParameter(param, {
        loadData: loadData,
    });

    return (
        <Dropdown
            id={id}
            ariaLabel={ariaLabel ?? param.label}
            className={className}
            style={style}
            disabled={disabled || loading}
            options={data ?? []}
            param={param}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
        />
    );
}
