import { initMockEnvironment } from "../environment";
import { translate } from "../localization/localization-util";
import { LocalizedStrings } from "../localization/localized-strings";

describe("Localization utilities", () => {
    beforeEach(() => {
        initMockEnvironment();
    });

    test("Can return simple english strings", () => {
        expect(
            translate("lib.common.form.validation.booleanValueError")
        ).toEqual("Value must be a boolean");
    });

    test("Throw error if string is unknown", () => {
        expect(() =>
            translate("Invalid" as unknown as keyof LocalizedStrings)
        ).toThrowError("Unable to translate string Invalid");
    });
});
