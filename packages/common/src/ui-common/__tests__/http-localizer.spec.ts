import { HttpLocalizer } from "../localization/http-localizer";
import { CustomGlobal } from "./setup-tests";

declare const global: CustomGlobal;

describe("HttpLocalizer", () => {
    let httpLocalizer: HttpLocalizer;
    let fetchMock: jest.Mock;

    beforeAll(() => {
        const globalObject: CustomGlobal = global;
        globalObject.window = {};
        globalObject.navigator = {
            language: "en-US",
        };
    });

    beforeEach(() => {
        httpLocalizer = new HttpLocalizer();
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });

    afterEach(() => {
        fetchMock.mockRestore();
    });

    test("Load the correct translation file based on the locale", async () => {
        const testTranslations = { hello: "world" };
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

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
        const globalObject: CustomGlobal = global;
        globalObject.navigator.language = "fr-FR";
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
        const globalObject: CustomGlobal = global;
        globalObject.navigator.language = "abc";
        await httpLocalizer.loadTranslations();
        expect(fetchMock).toHaveBeenCalledWith(
            "/resources/i18n/resources.en.json"
        );
    });

    test("Throw error if translations have not been loaded", () => {
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

        await httpLocalizer.loadTranslations();
        expect(httpLocalizer.translate("notFound")).toEqual("notFound");
    });
});
