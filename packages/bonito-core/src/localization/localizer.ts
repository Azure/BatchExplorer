export interface Localizer {
    translate(message: string): string;
    getLocale(): string;
}
