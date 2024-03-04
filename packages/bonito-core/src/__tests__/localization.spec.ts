import { initMockEnvironment } from "../environment";
import { replaceTokens, translate } from "../localization/localization-util";
import { LocalizedStrings } from "../localization/localized-strings";

describe("Localization utilities", () => {
    beforeEach(() => {
        initMockEnvironment();
    });

    test("Can return simple english strings", () => {
        expect(
            translate("bonito.core.form.validation.booleanValueError")
        ).toEqual("Value must be a boolean");
    });

    test("Throws error if string is unknown", () => {
        expect(() =>
            translate("Invalid" as unknown as keyof LocalizedStrings)
        ).toThrowError("Unable to translate string Invalid");
    });

    test("Can translate parameterized strings", () => {
        expect(
            translate("bonito.core.form.validation.minLengthError", {
                length: 5,
            })
        ).toEqual("Value must be at least 5 characters long");
    });

    describe("Token replacer", () => {
        test("Can replace a single token", () => {
            expect(replaceTokens("Hello {name}", { name: "World" })).toEqual(
                "Hello World"
            );
        });
        test("Ignores unknown tokens", () => {
            expect(replaceTokens("Hello {name}", {})).toEqual("Hello {name}");
        });
        test("Can replace multiple tokens", () => {
            expect(
                replaceTokens("{emotion} is the {organ} {role}", {
                    emotion: "Fear",
                    organ: "mind",
                    role: "killer",
                })
            ).toEqual("Fear is the mind killer");
        });
        test("Ignores unparametrized strings", () => {
            expect(replaceTokens("Hello World", { name: "World" })).toEqual(
                "Hello World"
            );
        });
        test("Handles non-string tokens", () => {
            expect(replaceTokens("Who is my #{num}?", { num: 5 })).toEqual(
                "Who is my #5?"
            );
            expect(
                replaceTokens("Too good to be {state}", { state: true })
            ).toEqual("Too good to be true");
            expect(
                replaceTokens("Bear {truth} witness", { truth: false })
            ).toEqual("Bear false witness");
        });
        test("Handles multiple instances of the same token", () => {
            expect(
                replaceTokens("{name} is the name of my {name}", {
                    name: "cat",
                })
            ).toEqual("cat is the name of my cat");
        });
        test("Handles whitespace around tokens", () => {
            expect(replaceTokens("Hello { name }", { name: "World" })).toEqual(
                "Hello World"
            );
        });
    });
});
