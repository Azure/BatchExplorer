import { Localizer } from "./localizer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STRINGS = (globalThis as unknown as any).__TEST_RESOURCE_STRINGS;

export class FakeLocalizer implements Localizer {
    translate(message: string): string {
        const value = STRINGS[message];
        if (value == null) {
            throw new Error("Unable to translate string " + message);
        }
        return value;
    }
}
