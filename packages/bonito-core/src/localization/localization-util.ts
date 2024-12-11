import { getEnvironment } from "../environment";
import { LocalizedStrings } from "./localized-strings";
import { Localizer } from "./localizer";

export function translate(
    message: Extract<keyof LocalizedStrings, string>
): string {
    return getLocalizer().translate(
        message as unknown as keyof LocalizedStrings
    );
}

export function getLocalizer(): Localizer {
    return getEnvironment().getLocalizer();
}

// format string with {0}, {1}, etc. placeholders
export function formatString(
    message: string,
    ...args: (string | number)[]
): string {
    return message.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== "undefined"
            ? args[number].toString()
            : match;
    });
}
