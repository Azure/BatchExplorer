import { HttpLocalizer } from "../localization/http-localizer";

describe("HttpLocalizer", () => {
    let httpLocalizer: HttpLocalizer;
    let fetchMock: jest.Mock;

    const testTranslations = {
        hello: "world",
        parameterized: "Hello, {name}",
    };
    const frenchTranslations = { bonjour: "monde" };

    const setUpTranslations = (
        translations: { [key: string]: string } = testTranslations,
        locale = "en-US"
    ) => {
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(translations),
            })
        );
        jest.spyOn(httpLocalizer, "getLocale").mockReturnValue(locale);
    };

    beforeEach(() => {
        httpLocalizer = new HttpLocalizer();
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });

    test("Load the correct translation file based on the locale", async () => {
        setUpTranslations();

        await httpLocalizer.loadTranslations("/base/url");
        expect(fetchMock).toHaveBeenCalledWith("/base/url/resources.en.json");
        expect(httpLocalizer.translate("hello")).toEqual("world");
    });

    test("Load the correct translation file for French locale", async () => {
        setUpTranslations(frenchTranslations, "fr-FR");

        await httpLocalizer.loadTranslations("/resources/i18n");
        expect(fetchMock).toHaveBeenCalledWith(
            "/resources/i18n/resources.fr.json"
        );
        expect(httpLocalizer.translate("bonjour")).toEqual("monde");
    });

    test("Default to English if locale not found", async () => {
        // Simulate an invalid locale
        setUpTranslations(testTranslations, "abc");

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
        setUpTranslations();

        await httpLocalizer.loadTranslations("/resources/i18n");
        expect(httpLocalizer.translate("notFound")).toEqual("notFound");
    });

    test("Supports parameterized translations", async () => {
        setUpTranslations();

        await httpLocalizer.loadTranslations("/base/url");
        expect(
            httpLocalizer.translate("parameterized", { name: "world" })
        ).toEqual("Hello, world");
    });
});
