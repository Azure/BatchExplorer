// For any functions involving shared libraries form controls
// used throughout the playground

import { RadioButtonOption } from "@batch/ui-react/lib/components/form/radio-button";

/*
 * Syncs the updated value of a shared libraries text field with a playground component
 */
export function newTextfieldOnChange(
    setValue: React.Dispatch<React.SetStateAction<string>>
): (newValue?: string | undefined) => void {
    function Result(newValue?: string | undefined): void {
        if (newValue) {
            setValue(newValue);
        }
    }
    return Result;
}

/*
 * Syncs the updated value of a shared libraries radio button group with a playground component
 */
export function radioButtonOnChange(
    setValue: React.Dispatch<React.SetStateAction<string>>
): () => void {
    function Result(
        ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
        option?: RadioButtonOption
    ): void {
        if (option) {
            setValue(option.key);
        }
    }
    return Result;
}
