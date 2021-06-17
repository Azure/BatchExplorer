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

// This function is called when the input changes

/*  const inputHandler = React.useCallback(
        (
            event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string
        ) => {
            const enteredName = (event.target as HTMLTextAreaElement).value;
            setQuery(enteredName);
        },
        []
    );

    // This function is triggered when the Search buttion is clicked
    const search = () => {
        const foundItems = PRODUCTS.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        setResult(foundItems);
    }; */

// Interface for adding Fluent UI icons to the list of most commonly used icons
export interface Item {
    id: number;
    name: string;
}
/*
 * This is a list of the Fluent UI icons that are most commonly used in Batch Explorer.
 * To see the full list of icons : https://uifabricicons.azurewebsites.net/
 */
export const ICONS: Item[] = [
    {
        id: 1,
        name: "Accept",
    },
    {
        id: 2,
        name: "Add",
    },
    {
        id: 3,
        name: "Calendar",
    },
    {
        id: 4,
        name: "ChevronLeft",
    },
    {
        id: 5,
        name: "ChevronRight",
    },
    {
        id: 6,
        name: "ChromeFullScreen",
    },
    {
        id: 7,
        name: "Clear",
    },
    {
        id: 8,
        name: "Delete",
    },
    {
        id: 9,
        name: "Download",
    },
    {
        id: 10,
        name: "DownloadDocument",
    },
    {
        id: 11,
        name: "Edit",
    },
    {
        id: 12,
        name: "Filter",
    },
    {
        id: 13,
        name: "FilterSolid",
    },
    {
        id: 14,
        name: "Info",
    },
    {
        id: 15,
        name: "Label",
    },
    {
        id: 16,
        name: "NavigateExternalInline",
    },
    {
        id: 17,
        name: "Recent",
    },
    {
        id: 18,
        name: "Refresh",
    },
    {
        id: 19,
        name: "RemoveFilter",
    },
    {
        id: 20,
        name: "Save",
    },
    {
        id: 21,
        name: "StackedColumnChart2Fill",
    },
    {
        id: 22,
        name: "ToggleLeft",
    },
    {
        id: 23,
        name: "ToggleRight",
    },
];
