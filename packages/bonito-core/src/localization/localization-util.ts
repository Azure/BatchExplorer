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
