import { FormValues, ParameterName } from "@batch/ui-common/lib/form";
import * as React from "react";
import { LocationDependencies, LocationParameter } from "../../form";
import { useUniqueId } from "../../hooks";
import { useFormParameter } from "../../hooks/use-form-parameter";
import { Dropdown } from "./dropdown";
import { ParamControlProps } from "./form-control";

export function LocationDropdown<
    V extends FormValues,
    K extends ParameterName<V>
>(
    props: ParamControlProps<
        V,
        K,
        LocationDependencies<V>,
        LocationParameter<V, K, LocationDependencies<V>>
    >
): JSX.Element {
    const { param, onChange } = props;

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
