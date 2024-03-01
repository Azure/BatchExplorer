export type LocalizerTokenMap = Record<string, string | number | boolean>;

export interface Localizer {
    translate(message: string, tokens?: LocalizerTokenMap): string;
    getLocale(): string;
}
