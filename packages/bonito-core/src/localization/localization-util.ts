import { getEnvironment } from "../environment";
import { LocalizedStrings } from "./localized-strings";
import { Localizer, LocalizerTokenMap } from "./localizer";

export function translate(
    message: Extract<keyof LocalizedStrings, string>,
    tokens?: LocalizerTokenMap
): string {
    return getLocalizer().translate(
        message as unknown as keyof LocalizedStrings,
        tokens
    );
}

export function getLocalizer(): Localizer {
    return getEnvironment().getLocalizer();
}

export function replaceTokens(text: string, tokens: LocalizerTokenMap): string {
    return text.replace(/{\s*([\w.]+)\s*}/g, (match, token) =>
        token in tokens ? String(tokens[token]) : match
    );
}
