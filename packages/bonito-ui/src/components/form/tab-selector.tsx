import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { delayedCallback } from "@azure/bonito-core/lib/util";
import { IPivotStyles, Pivot, PivotItem } from "@fluentui/react/lib/Pivot";
import * as React from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";

export interface TabSelectorProps<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
> extends FormControlProps<V, K, D> {
    overflowBehavior?: "none" | "menu" | "wrap";
    options: TabOption<V, K>[];
    valueToKey?: (value?: V[K]) => string;
}

export interface TabOption<V extends FormValues, K extends ParameterName<V>> {
    key?: string;
    value: V[K];
    label?: string;
}

const undefinedKey = "<<<No selection>>>";
const nullKey = "<<<None>>>";

/**
 * A tab selection form control supporting single selection
 */
export function TabSelector<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
>(props: TabSelectorProps<V, K, D>): JSX.Element {
    const {
        ariaLabel,
        className,
        // disabled,
        onFocus,
        onBlur,
        onChange,
        options,
        param,
        style,
        valueToKey,
        overflowBehavior,
    } = props;

    const id = useUniqueId("tab-selector", props.id);
    const { setDirty } = useFormParameter(param);

    const [hasFocused, setHasFocused] = React.useState<boolean>(false);

    // Default to first option if the parameter is required
    if (param.required && param.value == null && options.length > 0) {
        // Do this asynchronously so that the current render finishes first
        delayedCallback(() => {
            param.value = options[0].value;
        });
    }

    const transformedOptions = _transformOptions(options, valueToKey);

    const indexByKey: Record<string, number> = {};
    let idx = 0;
    const pivotItems = transformedOptions.map((opt) => {
        if (!opt.key) {
            console.warn(`Tab option ${opt} has no key`);
            return <></>;
        }
        indexByKey[opt.key] = idx++;
        return (
            <PivotItem
                key={opt.key}
                itemKey={opt.key}
                headerText={opt.label ?? opt.key}
            />
        );
    });

    const toKey = valueToKey ?? defaultValueToKey;

    let pivotOverflow: "none" | "menu" = "menu";
    let pivotStyles: Partial<IPivotStyles> | undefined = undefined;
    if (overflowBehavior === "wrap") {
        pivotOverflow = "none";
        pivotStyles = { root: { display: "flex", flexWrap: "wrap" } };
    } else if (overflowBehavior) {
        pivotOverflow = overflowBehavior;
    }

    return (
        <Pivot
            id={id}
            aria-label={ariaLabel ?? param.label}
            className={className}
            style={style}
            styles={pivotStyles}
            overflowBehavior={pivotOverflow}
            // TODO: Support disabled, errorMessage
            // disabled={disabled || param.disabled}
            // errorMessage={validationError}
            selectedKey={param.value == null ? undefined : toKey(param.value)}
            onFocus={(event) => {
                setHasFocused(true);
                if (onFocus) {
                    onFocus(event);
                }
            }}
            onBlur={onBlur}
            onLinkClick={(item, event) => {
                if (hasFocused) {
                    setDirty(true);
                }
                const itemKey = item?.props.itemKey;
                if (!itemKey) {
                    console.warn("PivotItem does not have an itemKey property");
                    return;
                }

                const selectionIndex = indexByKey[itemKey];
                param.value = transformedOptions[selectionIndex].value;
                if (onChange) {
                    // KLUDGE: Revisit what event type onChange needs
                    //         to take for the portal form API.
                    //         Maybe just use SyntheticEvent instead?
                    onChange(event as React.FormEvent, param.value);
                }
            }}
        >
            {pivotItems}
        </Pivot>
    );
}

function defaultValueToKey<V>(value?: V): string {
    if (value === undefined) {
        return undefinedKey;
    }
    if (value === null) {
        return nullKey;
    }

    const stringValue = String(value);
    if (stringValue === undefinedKey || stringValue === nullKey) {
        throw new Error(
            `Invalid key "${stringValue}". Cannot use a key which is reserved for null or undefined values.`
        );
    }
    return stringValue;
}

function _transformOptions<V extends FormValues, K extends ParameterName<V>>(
    options: TabOption<V, K>[],
    valueToKey?: (value?: V[K]) => string
): TabOption<V, K>[] {
    const toKey = valueToKey ?? defaultValueToKey;
    return options.map((option) => {
        const key = toKey(option.value);
        return {
            key: key,
            label: option.label ?? key,
            value: option.value,
        };
    });
}
