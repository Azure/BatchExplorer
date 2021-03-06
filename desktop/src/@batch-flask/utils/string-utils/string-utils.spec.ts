import { StringUtils } from "./string-utils";

describe("StringUtils", () => {
    describe("matchWildcard()", () => {
        it("should match a wildcard without *", () => {
            const wildcard = "abc";
            expect(StringUtils.matchWildcard("abc", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("abcabc", wildcard)).toBe(false);
            expect(StringUtils.matchWildcard("aabcc", wildcard)).toBe(false);
        });

        it("should match a wildcard starting with  *", () => {
            const wildcard = "*abc";
            expect(StringUtils.matchWildcard("FooBarabc", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("abc", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("abcabc", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("abcFoo", wildcard)).toBe(false);
        });

        it("should match a wildcard ending with  *", () => {
            const wildcard = "abc*";

            expect(StringUtils.matchWildcard("abcFoo", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("abc", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("abcabc", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("FooBarabc", wildcard)).toBe(false);
        });

        it("should match a wildcard  with * in the middle", () => {
            const wildcard = "Foo*Bar";

            expect(StringUtils.matchWildcard("FooWhatBar", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("FooBar", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("FooSomethingBarWrong", wildcard)).toBe(false);
        });

        it("should match a wildcard surrounded by *", () => {
            const wildcard = "*Ba*";
            expect(StringUtils.matchWildcard("FooWhatBar", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("foowhatbar", wildcard, false)).toBe(true);
            expect(StringUtils.matchWildcard("FooBar", wildcard)).toBe(true);
            expect(StringUtils.matchWildcard("FooSomethingWrong", wildcard)).toBe(false);
        });
    });
});
