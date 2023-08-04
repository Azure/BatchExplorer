import { getEnvironment } from "../environment";
import { LocalizedStrings } from "./localized-strings";
import { Localizer } from "./localizer";

// The 'message' argument extracts just the string keys of the LocalizedStrings
// interface because otherwise keys can be numbers or symbols as well
export function translate(
    message: Extract<keyof LocalizedStrings, string>
): string {
    return getLocalizer().translate(message);
}

export function getLocalizer(): Localizer {
    return getEnvironment().getLocalizer();
}
