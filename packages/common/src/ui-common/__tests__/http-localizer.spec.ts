import { HttpLocalizer } from "../localization/http-localizer";
import { Mutable } from "../types";

describe("HttpLocalizer", () => {
    let httpLocalizer: HttpLocalizer;
    let fetchMock: jest.Mock;

    const navigator: Mutable<typeof globalThis.navigator> =
        globalThis.navigator;
    const originalLanguage = globalThis.navigator.language;

    beforeEach(() => {
        httpLocalizer = new HttpLocalizer();
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });

    afterAll(() => {
        navigator.language = originalLanguage;
    });

    test("Load the correct translation file based on the locale", async () => {
        const testTranslations = { hello: "world" };
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

        navigator.language = "en-US";
        await httpLocalizer.loadTranslations();
        expect(fetchMock).toHaveBeenCalledWith(
            "/resources/i18n/resources.en.json"
        );
        expect(httpLocalizer.translate("hello")).toEqual("world");
    });

    test("Load the correct translation file for French locale", async () => {
        const testTranslations = { bonjour: "monde" };
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

        // Simulate a French locale
        navigator.language = "fr-FR";
        await httpLocalizer.loadTranslations();
        expect(fetchMock).toHaveBeenCalledWith(
            "/resources/i18n/resources.fr.json"
        );
        expect(httpLocalizer.translate("bonjour")).toEqual("monde");
    });

    test("Default to English if locale not found", async () => {
        const testTranslations = { hello: "world" };
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

        // Simulate an invalid locale
        navigator.language = "abc";
        await httpLocalizer.loadTranslations();
        expect(fetchMock).toHaveBeenCalledWith(
            "/resources/i18n/resources.en.json"
        );
    });

    test("Throw error if translations have not been loaded", () => {
        navigator.language = "en-US";
        expect(() => httpLocalizer.translate("hello")).toThrowError(
            "Translation strings are not loaded hello"
        );
    });

    test("Return original message if no translation found", async () => {
        const testTranslations = { hello: "world" };
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

        navigator.language = "en-US";
        await httpLocalizer.loadTranslations();
        expect(httpLocalizer.translate("notFound")).toEqual("notFound");
    });
});
