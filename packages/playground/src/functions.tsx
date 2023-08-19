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
    function Result(
        e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void {
        param((e.target as HTMLTextAreaElement).value);
    }
    return Result;
}

/*
 * Checks the value of a URL entered into a textbox to make sure that it is valid
 */
export function UrlOnChange(
    settingErrorMsg: React.Dispatch<React.SetStateAction<string>>,
    settingActualUrl: React.Dispatch<React.SetStateAction<string>>
): (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
) => void {
    function Result(
        event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ): void {
        if (
            !newValue ||
            ((newValue.startsWith("http") || newValue.startsWith("https")) &&
                newValue.includes(".") &&
                newValue.lastIndexOf(".") != newValue.length - 1) ||
            (!newValue && newValue[0] == "/")
        ) {
            settingErrorMsg("");
            settingActualUrl(newValue || "");
        } else {
            settingErrorMsg("Error: Invalid URL (must begin with HTTP or /)");
            settingActualUrl(newValue);
        }
    }
    return Result;
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
    function Result(
        ev?: React.FormEvent<HTMLInputElement | HTMLElement>,
        option?: IChoiceGroupOption
    ): void {
        param(option?.key);
    }
    return Result;
}

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

/*
 * Function that gets the height and width of a user's browser/app
 * window and updates on every resize
 */
export function HeightAndWidth(): number[] {
    const [height, setHeight] = React.useState(window.innerHeight);
    const [width, setWidth] = React.useState(window.innerWidth);

    const updateDimensions = () => {
        setHeight(window.innerHeight);
        setWidth(window.innerWidth);
    };

    React.useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return [height, width];
}
