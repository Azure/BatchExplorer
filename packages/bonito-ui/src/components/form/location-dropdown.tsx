import { FormValues, ParameterName } from "@azure/bonito-core/lib/form";
import * as React from "react";
import { LocationDependencies, LocationParameter } from "../../form";
import { useUniqueId } from "../../hooks";
import { useFormParameter } from "../../hooks/use-form-parameter";
import { Dropdown, DropdownOption } from "./dropdown";
import { FormControlProps } from "./form-control";

export function LocationDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: FormControlProps<
        V,
        K,
        LocationDependencies<V>,
        LocationParameter<V, K, LocationDependencies<V>>
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
        const locations = await param.loadLocations();
        return locations
            .map((location) => {
                return {
                    value: location.id,
                    label: location.regionalDisplayName,
                };
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
