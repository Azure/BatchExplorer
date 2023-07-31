import { Localizer } from "./localizer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STRINGS = (globalThis as unknown as any).__TEST_RESOURCE_STRINGS;

export class FakeLocalizer implements Localizer {
    private locale: string;

    constructor() {
        this.locale = "en";
    }

    translate(message: string): string {
        const value = STRINGS[message];
        if (value == null) {
            throw new Error("Unable to translate string " + message);
        }
        return value;
    }

    getLocale(): string {
        return this.locale;
    }

    setLocale(locale: string): void {
        this.locale = locale;
    }
}
