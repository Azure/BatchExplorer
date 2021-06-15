// For any functions used throughout the playground

import React from "react";
import { IChoiceGroupOption } from "@fluentui/react/lib/ChoiceGroup";

/*
 * Syncs the updated value of a text field with a playground component
 */
export function TextFieldOnChange(
    param: React.Dispatch<React.SetStateAction<string>>
): (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
) => void {
    // ...
    const Hello = (
        e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ) => {
        param((e.target as HTMLTextAreaElement).value);
    };

    return Hello;
}

/*
 * Syncs the updated value of a radio button selection [choice group in Fluent UI] with a playground component
 */
export function ChoiceGroupOnChange(
    param: React.Dispatch<React.SetStateAction<string | undefined>>
): (
    ev?: React.FormEvent<HTMLInputElement | HTMLElement> | undefined,
    option?: IChoiceGroupOption | undefined
) => void {
    // ...
    const Hello = React.useCallback(
        (
            ev?: React.FormEvent<HTMLInputElement | HTMLElement>,
            option?: IChoiceGroupOption
        ) => {
            param(option?.key);
        },
        []
    );

    return Hello;
}
