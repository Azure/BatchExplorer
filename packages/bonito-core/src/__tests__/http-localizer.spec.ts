import { HttpLocalizer } from "../localization/http-localizer";

describe("HttpLocalizer", () => {
    let httpLocalizer: HttpLocalizer;
    let fetchMock: jest.Mock;

    const testTranslations = { hello: "world" };
    const frenchTranslations = { bonjour: "monde" };

    beforeEach(() => {
        httpLocalizer = new HttpLocalizer();
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });

    test("Load the correct translation file based on the locale", async () => {
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

        jest.spyOn(httpLocalizer, "getLocale").mockReturnValue("en-US");
        await httpLocalizer.loadTranslations("/base/url");
        expect(fetchMock).toHaveBeenCalledWith("/base/url/resources.en.json");
        expect(httpLocalizer.translate("hello")).toEqual("world");
    });

    test("Load the correct translation file for French locale", async () => {
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(frenchTranslations),
            })
        );

        // Simulate a French locale
        jest.spyOn(httpLocalizer, "getLocale").mockReturnValue("fr-FR");
        await httpLocalizer.loadTranslations("/resources/i18n");
        expect(fetchMock).toHaveBeenCalledWith(
            "/resources/i18n/resources.fr.json"
        );
        expect(httpLocalizer.translate("bonjour")).toEqual("monde");
    });

    test("Default to English if locale not found", async () => {
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

        // Simulate an invalid locale
        jest.spyOn(httpLocalizer, "getLocale").mockReturnValue("abc");
        await httpLocalizer.loadTranslations("/resources/i18n");
        expect(fetchMock).toHaveBeenCalledWith(
            "/resources/i18n/resources.en.json"
        );
    });

    test("Throw error if translations have not been loaded", () => {
        jest.spyOn(httpLocalizer, "getLocale").mockReturnValue("en-US");
        expect(() => httpLocalizer.translate("hello")).toThrowError(
            "Translation strings are not loaded hello"
        );
    });

    test("Return original message if no translation found", async () => {
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(testTranslations),
            })
        );

        jest.spyOn(httpLocalizer, "getLocale").mockReturnValue("en-US");
        await httpLocalizer.loadTranslations("/resources/i18n");
        expect(httpLocalizer.translate("notFound")).toEqual("notFound");
    });
});
