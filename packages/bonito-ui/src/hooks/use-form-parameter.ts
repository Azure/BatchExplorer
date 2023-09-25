import { useCallback, useEffect, useState } from "react";
import {
    FormValues,
    ParameterDependencies,
    ParameterName,
    Parameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import { useAsyncEffect } from "./use-async-effect";

/**
 * Hook for reacting to state changes for a given form parameter. Returns
 * various state variables useful for rendering a form control for the
 * given parameter.
 *
 * @param param The form parameter to use
 * @param opts Various options such as callbacks for reacting to changes, etc.
 *
 * @returns A set of state variables that can be used in form controls.
 */
export function useFormParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = never,
    DataResult = never
>(
    param: Parameter<V, K, D>,
    opts: {
        /**
         * Callback for whenever the parameter value changes
         *
         * @param value The new parameter value
         * @param oldValue The previous parameter value
         */
        onParameterChange?: (newValue: V[K], oldValue: V[K]) => void;

        /**
         * Callback for whenever the form values change
         *
         * @param newValues The newest values
         * @param oldValues The previous values
         */
        onFormChange?: (newValues: V, oldValues: V) => void;

        /**
         * Callback for whenever a dependency of this parameter changes
         *
         * @param newValues The newest values
         * @param oldValues The previous values
         */
        onDependencyChange?: <DK extends ParameterName<V>>(
            dependencyName: keyof D & string,
            parameterName: DK,
            newValue: V[DK],
            oldValue: V[DK]
        ) => void;

        /**
         * Callback to asynchronously load data on initial render, and also
         * whenever a parameter dependency changes.
         *
         * @returns A promise which resolves to the loaded data
         */
        loadData?: () => Promise<DataResult>;
    } = {}
) {
    const { onParameterChange, onDependencyChange, onFormChange, loadData } =
        opts;

    /**
     * Mark this parameter as having been modified by user interaction.
     * This can be useful for determining whether validation should be run
     * immediately or deferred until either a user modifies the value or
     * a the form is submitted.
     */
    const [dirty, setDirty] = useState<boolean>(false);

    const [validationError, setValidationError] = useState<
        string | undefined
    >();

    const [validationErrorData, setValidationErrorData] = useState<any>();
    const [validationStatus, setValidationStatus] = useState<
        ValidationStatus | undefined
    >();
    const [data, setData] = useState<DataResult | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(loadData == null);
    const [loadingPromise, setLoadingPromise] = useState<Promise<DataResult>>();

    // KLUDGE: This simply exists to force rerenders when dependencies or
    //         form values change. Keeping track of the actual state isn't
    //         really needed, as the parameter and dependency values are
    //         already available on the parameter object.
    const [_, setChangeCount] = useState<number>(0);
    const incrementChangeCount = useCallback(() => {
        setChangeCount((c) => c + 1);
    }, []);

    // Change events
    useEffect(() => {
        const changeHandler = param.parentForm.on(
            "change",
            (newValues, oldValues) => {
                let changeDetected = false;

                // Hook up onFormChange
                if (onFormChange) {
                    if (newValues !== oldValues) {
                        onFormChange(newValues, oldValues);
                    }
                }

                // Hook up onParameterChange
                if (newValues[param.name] !== oldValues[param.name]) {
                    changeDetected = true;
                    if (onParameterChange) {
                        onParameterChange(
                            newValues[param.name],
                            oldValues[param.name]
                        );
                    }
                }

                // Load data and/or fire onDependencyChange when dependencies
                // are updated
                if (param.dependencies) {
                    for (const [depName, depParam] of Object.entries(
                        param.dependencies
                    )) {
                        if (newValues[depParam] !== oldValues[depParam]) {
                            // Forces a re-render
                            changeDetected = true;

                            if (loadData) {
                                const loadingPromise = loadData();
                                setLoading(true);
                                setLoadingPromise(loadingPromise);

                                loadingPromise.then((result) => {
                                    setLoading(false);
                                    setLoadingPromise(undefined);
                                    setData(result);
                                });
                            }
                            if (onDependencyChange) {
                                onDependencyChange(
                                    depName,
                                    depParam,
                                    newValues[depParam],
                                    oldValues[depParam]
                                );
                            }
                        }
                    }
                }

                if (changeDetected) {
                    // Force a re-render
                    incrementChangeCount();
                }
            }
        );

        return () => {
            param.parentForm.off("change", changeHandler);
        };
    }, [
        param,
        onDependencyChange,
        onFormChange,
        onParameterChange,
        loadData,
        incrementChangeCount,
    ]);

    useEffect(() => {
        const validationHandler = param.parentForm.on(
            "validate",
            (snapshot) => {
                setValidationStatus(snapshot.entryStatus[param.name]);
                if (dirty || param.validationStatus?.forced) {
                    const msg = param.validationStatus?.message;
                    const data = param.validationStatus?.data;
                    // Only set a visible validation error if the user has
                    // interacted with the form control (ie: the parameter is
                    // dirty) or validation is forced (usually the result of
                    // clicking a submit button and validating the entire
                    // form)
                    if (param.validationStatus?.level === "error") {
                        setValidationError(msg);
                        setValidationErrorData(data);
                    } else {
                        setValidationError(undefined);
                        setValidationErrorData(undefined);
                    }
                    setDirty(true);
                }
            }
        );
        return () => {
            param.parentForm.off("validate", validationHandler);
        };
    }, [param, dirty]);

    // Initial data loading. Subsequent loads are handled when dependencies
    // change.
    useAsyncEffect(async () => {
        if (loadData) {
            setData((await loadData()) as DataResult);
        }
    }, [loadData, setData]);

    return {
        data,
        dirty,
        setDirty,
        loading,
        loadingPromise,
        validationError,
        validationStatus,
        validationErrorData,
    };
}
