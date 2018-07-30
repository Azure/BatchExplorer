import { I18nService } from "@batch-flask/core";

const translations = {
    "foo.bar": "Banana",
    "some.random.path": "Potato",
    "with.params": "This is a {animal}",
};

describe("I18nService", () => {
    let i18n: I18nService;

    beforeEach(() => {
        i18n = new I18nService({
            translations: new Map(Object.entries(translations)),
        } as any);
    });

    it("translate by key", () => {
        expect(i18n.translate("foo.bar")).toEqual("Banana");
        expect(i18n.translate("some.random.path")).toEqual("Potato");
    });

    it("returns key if translation not found", () => {
        expect(i18n.translate("foo.unkown")).toEqual("foo.unkown");
        expect(i18n.translate("foo.unkown", { some: "not used" })).toEqual("foo.unkown");
    });

    it("translate by key with params", () => {
        expect(i18n.translate("with.params", { animal: "dog" })).toEqual("This is a dog");
        expect(i18n.translate("some.random.path", { invalid: "Not used" })).toEqual("Potato");
    });

    it("#t() is #translate() alias", () => {
        expect(i18n.t("foo.bar")).toEqual(i18n.translate("foo.bar"));
        expect(i18n.t("some.random.path")).toEqual(i18n.translate("some.random.path"));
    });
});
