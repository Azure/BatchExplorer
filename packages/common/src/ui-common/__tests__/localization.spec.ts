import { initMockEnvironment } from "../environment";
import { translate } from "../localization/localization-util";

describe("Localization utilities", () => {
    beforeEach(() => {
        initMockEnvironment();
    });

    test("Can return simple english strings", () => {
        expect(translate("lib.common.form.validationError")).toEqual(
            "Value must be a boolean"
        );
    });

    test("Throw error if string is unknown", () => {
        expect(() => translate("Invalid")).toThrowError(
            "Unable to translate string Invalid"
        );
    });
});
