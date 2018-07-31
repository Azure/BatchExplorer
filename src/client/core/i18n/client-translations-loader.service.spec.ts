import { Constants } from "client/client-constants";
import * as path from "path";
import { ClientTranslationsLoaderService } from "./client-translations-loader.service";

const dev = {
    "foo.banana": "Banana",
    "foo.potato": "Potato",
    "foo.blueberry": "Blueberry",
};
const english = {
    "foo.banana": "Banana",
    "foo.potato": "Potato",
};

const french = {
    "foo.potato": "Pomme de terre",
};

describe("ClientTranslationsLoaderService", () => {
    const localService = {
        locale: "fr",
    };

    let loader: ClientTranslationsLoaderService;

    let fsSpy;
    let devTranslationLoaderSpy;
    let lastEnv;

    beforeEach(() => {
        lastEnv = process.env.NODE_ENV;
        devTranslationLoaderSpy = {
            load: jasmine.createSpy("load").and.returnValue(Promise.resolve(new Map(Object.entries(dev)))),
        };

        fsSpy = {
            exists: () => Promise.resolve(true),
            readFile: jasmine.createSpy("readFile").and.callFake((path: string) => {
                if (path.endsWith("fr.json")) {
                    return JSON.stringify(french);
                } else {
                    return JSON.stringify(english);
                }
            }),
        };
        loader = new ClientTranslationsLoaderService(fsSpy, localService as any, devTranslationLoaderSpy);
    });

    describe("when in production environment", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "production";
        });

        afterEach(() => {
            process.env.NODE_ENV = lastEnv;
        });

        it("it only loads the english translations file when locale is english", async () => {
            localService.locale = "en";
            await loader.load();
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledWith(path.join(Constants.resourcesFolder, "i18n/resources.en.json"));

            expect(loader.translations.get("foo.banana")).toEqual("Banana");
            expect(loader.translations.get("foo.potato")).toEqual("Potato");
        });

        it("it only loads the english translations file then french file when locale is french", async () => {
            localService.locale = "fr";
            await loader.load();
            expect(fsSpy.readFile).toHaveBeenCalledTimes(2);
            expect(fsSpy.readFile).toHaveBeenCalledWith(path.join(Constants.resourcesFolder, "i18n/resources.en.json"));
            expect(fsSpy.readFile).toHaveBeenCalledWith(path.join(Constants.resourcesFolder, "i18n/resources.fr.json"));

            expect(loader.translations.get("foo.potato")).toEqual("Pomme de terre");
            expect(loader.translations.get("foo.banana")).toEqual("Banana", "Use english translation when not present");
        });
    });

    describe("when in developement environment", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "developement";
        });

        afterEach(() => {
            process.env.NODE_ENV = lastEnv;
        });

        it("it only use the development loader when locale is english", async () => {
            localService.locale = "en";
            await loader.load();
            expect(devTranslationLoaderSpy.load).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).not.toHaveBeenCalled();

            expect(loader.translations.get("foo.banana")).toEqual("Banana");
            expect(loader.translations.get("foo.potato")).toEqual("Potato");
            expect(loader.translations.get("foo.blueberry")).toEqual("Blueberry");
        });

        it("it only loads the dev english translation then french file when locale is french", async () => {
            localService.locale = "fr";
            await loader.load();
            expect(devTranslationLoaderSpy.load).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledWith(path.join(Constants.resourcesFolder, "i18n/resources.fr.json"));

            expect(loader.translations.get("foo.potato")).toEqual("Pomme de terre");
            expect(loader.translations.get("foo.banana")).toEqual("Banana", "Use english translation when not present");
            expect(loader.translations.get("foo.blueberry")).toEqual("Blueberry");
        });
    });
});
