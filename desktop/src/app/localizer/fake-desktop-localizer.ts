import { Localizer } from "@azure/bonito-core/lib/localization";

export class FakeDesktopLocalizer implements Localizer {

    /**
     * Instead of looking up the translated string, simply return the
     * string's identitier.
     *
     * @param message The identifier of the string to translate
     * @returns The same string identifier that was passed in
     */
    translate(message: string): string {
        // TODO: When parameterized strings are supported, this should be
        //       encoded in the result (just like how the test translation
        //       service does it)
        return message;
    }

    getLocale(): string {
        return "en-US";
    }
}
